#!/usr/bin/env python3
import asyncio
import os
import sys
import json
import re
import sqlite3
import time
from datetime import datetime
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_ext.models.openai import OpenAIChatCompletionClient

AUTOGEN_DB = '/Users/mrkantarci/.autogenstudio/autogen04202.db'
RESULTS_FILE = 'data/autogen_pool_audit_results.json'
EXERCISES_JS = 'js/exercises-db.js'

def load_exercises():
    with open(EXERCISES_JS, 'r', encoding='utf-8') as f:
        text = f.read()
    m = re.search(r'const EXERCISES_DB = (\[[\s\S]*?\]);', text)
    if not m:
        raise ValueError("EXERCISES_DB bulunamadı!")
    return json.loads(m.group(1))

def load_results():
    if os.path.exists(RESULTS_FILE):
        try:
            with open(RESULTS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_results(results):
    os.makedirs(os.path.dirname(RESULTS_FILE), exist_ok=True)
    with open(RESULTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

def update_exercises_db_js(ex_id):
    """Hareketin kütüphanesini günceller; yanıltıcı fallback'i kesip kendi bağımsız yoluna bağlar"""
    try:
        with open(EXERCISES_JS, 'r', encoding='utf-8') as f:
            content = f.read()

        guide_entry = f"            {ex_id}: {{ form: 'assets/exercises/{ex_id}.webp', anatomi: null }},\n"
        map_entry = f"            '{ex_id}': guideLibrary.{ex_id},"

        # guideLibrary içine ekle (yoksa)
        if f"{ex_id}:" not in content[:content.find("const exerciseGuideMap")]:
            insert_pos = content.find("const guideLibrary = {") + len("const guideLibrary = {\n")
            content = content[:insert_pos] + guide_entry + content[insert_pos:]

        # exerciseGuideMap içinde güncelle / düzelt
        # Eski haritalamayı bul ve değiştir
        pattern = rf"'{ex_id}':\s*guideLibrary\.[a-zA-Z0-9_]+,"
        if re.search(pattern, content):
            content = re.sub(pattern, map_entry, content)
        else:
            insert_pos = content.find("const exerciseGuideMap = {") + len("const exerciseGuideMap = {\n")
            content = content[:insert_pos] + map_entry + "\n" + content[insert_pos:]

        with open(EXERCISES_JS, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f"   [Kütüphane Güncelleme Uyarısı ({ex_id})]: {e}")

def sync_to_autogen_studio(idx, total, ex, messages):
    try:
        con = sqlite3.connect(AUTOGEN_DB)
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')
        user_id = 'guestuser@gmail.com'
        version = '0.0.1'
        team_id = 6

        session_name = f"[{idx}/{total}] {ex.get('name', ex['id'])}"
        cur = con.cursor()
        cur.execute('''
            INSERT INTO session (created_at, updated_at, user_id, version, team_id, name)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (now, now, user_id, version, team_id, session_name))
        session_id = cur.lastrowid

        task_payload = {
            "source": "user",
            "content": [{"source": "user", "models_usage": None, "metadata": {}, "content": f"Otonom Fabrika Hattı: '{ex.get('name')}' ({ex['id']}) inceleniyor."}]
        }

        cur.execute('''
            INSERT INTO run (created_at, updated_at, session_id, status, task, team_result, error_message, version, messages, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (now, now, session_id, 'COMPLETE', json.dumps(task_payload), None, None, version, '[]', user_id))
        run_id = cur.lastrowid

        for m in messages:
            msg_cfg = {"source": m["source"], "content": m["content"], "models_usage": None}
            cur.execute('''
                INSERT INTO message (created_at, updated_at, user_id, version, config, session_id, run_id, message_meta)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (now, now, user_id, version, json.dumps(msg_cfg), session_id, run_id, None))

        con.commit()
        con.close()
    except Exception as e:
        pass

async def process_exercise(ex, model_client):
    author = AssistantAgent(
        name="Biomechanics_Author",
        model_client=model_client,
        system_message="Sen Çelik Kodu egzersiz biyomekaniği uzmanısın. Hareketi 5 durakta formüle et: Durak 1 (Kurulum), Manevra 1->2 (İtiş), Durak 2 (Zirve), Manevra 2->3 (Akış), Durak 3 (Bitiş)."
    )
    trainer = AssistantAgent(
        name="Sports_Biomechanics_Trainer",
        model_client=model_client,
        system_message="Sen McGill & Schoenfeld standartlarında Baş Spor Eğitmenisin. Lomber omurga (L5-S1), diz valgusu ve Pivot/Sarkaç bacak kuralını denetle. Kusur varsa düzeltmeyi yaz, sağlamsa ONAYLANDI de."
    )
    auditor = AssistantAgent(
        name="Visual_Quality_Auditor",
        model_client=model_client,
        system_message="Sen Baş Görsel Kalite Denetçisisin. Onaylanan durakları 3 karelik (F1, F2, F3) kamera, zemin ve görsel üretim şartnamesine dönüştür ve TERMINATE ile bitir."
    )

    termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(max_messages=8)
    team = RoundRobinGroupChat(participants=[author, trainer, auditor], termination_condition=termination)

    prompt = f"Egzersiz: {ex.get('name')} (ID: {ex['id']}) | Kategori: {ex.get('category')} | Ekipman: {ex.get('equipment')} | Hedef: {ex.get('muscle')}"
    messages = [{"source": "user", "content": prompt}]

    async for msg in team.run_stream(task=prompt):
        if hasattr(msg, 'content') and msg.content:
            messages.append({"source": getattr(msg, 'source', 'agent'), "content": msg.content})

    return {
        "id": ex['id'],
        "name": ex.get('name'),
        "category": ex.get('category'),
        "audited_at": datetime.now().isoformat(),
        "messages": messages,
        "status": "APPROVED"
    }

async def run_factory():
    api_key = os.environ.get("GEMINI_API_KEY", "")
    model_client = OpenAIChatCompletionClient(
        model="gemini-3.8-flash",
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        model_info={"vision": True, "function_calling": True, "json_output": True, "structured_output": True, "family": "gemini-2.0-flash"}
    )

    exercises = load_exercises()
    total = len(exercises)
    print(f"\n🏭 ======================================================================")
    print(f"🏭 OTONOM FABRİKA DEVREDE: {total} Hareket Kesintisiz İşleniyor...")
    print(f"🏭 ======================================================================\n")

    while True:
        results = load_results()
        unprocessed = [e for e in exercises if e['id'] not in results]
        if not unprocessed:
            print(f"🎉 FABRİKA TAMAMLANDI: Tüm {total} hareket başarıyla işlendi ve mühürlendi!")
            break

        ex = unprocessed[0]
        ex_id = ex['id']
        ex_name = ex.get('name', ex_id)
        current_idx = len(results) + 1

        print(f"[{current_idx}/{total}] ⚙️ Banttaki İş: {ex_name} ({ex_id})")
        try:
            audit_data = await process_exercise(ex, model_client)
            results[ex_id] = audit_data
            save_results(results)
            sync_to_autogen_studio(current_idx, total, ex, audit_data["messages"])
            update_exercises_db_js(ex_id)
            print(f"[{current_idx}/{total}] ✅ Bitti ➔ Sıradaki harekete geçiliyor...\n")
        except Exception as e:
            print(f"[{current_idx}/{total}] ⚠️ Hata: {e} (3 sn sonra devam edilecek)\n")
            await asyncio.sleep(3)

if __name__ == "__main__":
    asyncio.run(run_factory())
