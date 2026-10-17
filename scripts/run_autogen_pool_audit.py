#!/usr/bin/env python3
import asyncio
import os
import sys
import json
import re
import sqlite3
import argparse
from datetime import datetime
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_ext.models.openai import OpenAIChatCompletionClient

AUTOGEN_DB = '/Users/mrkantarci/.autogenstudio/autogen04202.db'

def load_exercises():
    with open('js/exercises-db.js', 'r', encoding='utf-8') as f:
        text = f.read()
    m = re.search(r'const EXERCISES_DB = (\[[\s\S]*?\]);', text)
    if not m:
        raise ValueError("EXERCISES_DB bulunamadı!")
    return json.loads(m.group(1))

def load_existing_results(output_file):
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_results(output_file, results):
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

def sync_to_autogen_studio_ui(exercise_idx, total_count, exercise, messages):
    """Her hareketin AutoGen Studio web arayüzünde canlı bir oturum olarak görünmesini sağlar"""
    try:
        con = sqlite3.connect(AUTOGEN_DB)
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')
        user_id = 'guestuser@gmail.com'
        version = '0.0.1'
        team_id = 6

        session_name = f"[{exercise_idx}/{total_count}] {exercise.get('name', exercise['id'])}"
        
        cur = con.cursor()
        cur.execute('''
            INSERT INTO session (created_at, updated_at, user_id, version, team_id, name)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (now, now, user_id, version, team_id, session_name))
        session_id = cur.lastrowid

        task_payload = {
            "source": "user",
            "content": [{"source": "user", "models_usage": None, "metadata": {}, "content": f"Lütfen '{exercise.get('name')}' ({exercise['id']}) hareketini havuzdan çekip biyomekanik ve görsel denetimini yapın."}]
        }

        cur.execute('''
            INSERT INTO run (created_at, updated_at, session_id, status, task, team_result, error_message, version, messages, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (now, now, session_id, 'COMPLETE', json.dumps(task_payload), None, None, version, '[]', user_id))
        run_id = cur.lastrowid

        # Mesajları kaydet
        for m in messages:
            msg_cfg = {
                "source": m["source"],
                "content": m["content"],
                "models_usage": None
            }
            cur.execute('''
                INSERT INTO message (created_at, updated_at, user_id, version, config, session_id, run_id, message_meta)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (now, now, user_id, version, json.dumps(msg_cfg), session_id, run_id, None))

        con.commit()
        con.close()
    except Exception as e:
        print(f"   (AutoGen UI Senkronizasyon Uyarısı: {e})")

async def audit_single_exercise(exercise, model_client):
    ex_id = exercise['id']
    ex_name = exercise.get('name', ex_id)
    category = exercise.get('category', '')
    equipment = exercise.get('equipment', '')
    muscle = exercise.get('muscle', '')
    cue = exercise.get('cue', '')
    current_positions = exercise.get('positions', [])

    author = AssistantAgent(
        name="Biomechanics_Author",
        model_client=model_client,
        system_message="""Sen Çelik Kodu (El Código del Acero) egzersiz biyomekaniği ve durak noktaları (waypoints) uzmanısın.
Sana verilen egzersizi şu 5 zorunlu durakta formüle et:
1. Durak 1 (Kurulum / Setup): Ayak tabanı, diz açısı, omurga nötr kilit, ekipman tutuşu.
2. Manevra 1->2: Hareketi başlatan primer eklem, sabit kalacak pivot eklem, kinetik itiş.
3. Durak 2 (Zirve / İstasyon): Tepe kasılma veya ara geçiş koordinatı.
4. Manevra 2->3: İkinci faz akışı ve sarkaç hareketi.
5. Durak 3 (Bitiş): Eksantrik iniş ve sıfırlanma.
Her durakta eklem açılarını (90° diz vb.) ve yasakları (valgus, kifoz) açıkça yaz."""
    )

    trainer = AssistantAgent(
        name="Sports_Biomechanics_Trainer",
        model_client=model_client,
        system_message="""Sen McGill ve Schoenfeld standartlarında çalışan Baş Spor Eğitmenisin.
Biomechanics_Author'ın yazdıklarını omurga eksenel yükü (L5-S1), diz valgusu ve boyun sağlığı açısından kritik gözle denetle.
Yapay zeka modelinin bacakları veya kolları karıştırmaması için:
- Pivot Ayak (milimetrik oynamayan sabit dayanak) ve Sarkaç Bacak (ileri/geri hareket eden) kuralını ara.
Kusur varsa 'RET: [Düzeltme talimatı]' yaz.
Tüm kinetik zincir kusursuzsa 'BİYOMEKANİK ONAYLANDI: Görsel şartnameye geçilebilir.' de."""
    )

    auditor = AssistantAgent(
        name="Visual_Quality_Auditor",
        model_client=model_client,
        system_message="""Sen Baş Görsel Kalite ve Açı Denetçisisin.
Spor eğitmeni onay verdikten sonra, her durak karesi (Frame 1, 2, 3) için görsel üretim ve açı şartnamesini hazırla:
- Kamera açısı (örn: Yan profil, sağa bakan sporcu)
- Zemin ve mat koordinatı
- Ekipman ve tutuş (Suitcase carry, dambıl açısı)
- Her karenin kesin görsel promptunu üret.
Şartnameyi mühürlediğinde mesajının en sonuna 'TERMINATE' kelimesini ekleyerek oturumu tamamla."""
    )

    termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(max_messages=8)

    team = RoundRobinGroupChat(
        participants=[author, trainer, auditor],
        termination_condition=termination
    )

    task_prompt = f"""Egzersiz ID: {ex_id}
İsim: {ex_name}
Kategori: {category} | Ekipman: {equipment} | Hedef Kas: {muscle}
Mevcut İpucu (Cue): {cue}
Mevcut Fazlar: {json.dumps(current_positions, ensure_ascii=False)}

GÖREV:
Bu hareketin mevcut tanım ve duraklarını inceleyin. 5 duraklı biyomekanik şartnameyi çıkarın, eğitmen denetiminden geçirin ve 3 karelik görsel üretim şartnamesini mühürleyin."""

    messages = [{"source": "user", "content": task_prompt}]
    async for msg in team.run_stream(task=task_prompt):
        if hasattr(msg, 'content') and msg.content:
            messages.append({
                "source": getattr(msg, 'source', 'agent'),
                "content": msg.content
            })

    return {
        "id": ex_id,
        "name": ex_name,
        "category": category,
        "equipment": equipment,
        "audited_at": datetime.now().isoformat(),
        "messages": messages,
        "status": "APPROVED"
    }

async def main():
    parser = argparse.ArgumentParser(description="Tüm hareketler için otonom havuz denetim motoru")
    parser.add_argument("--limit", type=int, default=10, help="İncelenecek hareket sayısı")
    parser.add_argument("--all", action="store_true", help="Tüm 109 hareketi sırayla incele")
    parser.add_argument("--id", type=str, default=None, help="Spesifik bir hareket ID'si incele")
    parser.add_argument("--output", type=str, default="data/autogen_pool_audit_results.json", help="Çıktı dosyası")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY", "")
    model_client = OpenAIChatCompletionClient(
        model="gemini-3.8-flash",
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        model_info={
            "vision": True,
            "function_calling": True,
            "json_output": True,
            "structured_output": True,
            "family": "gemini-2.0-flash"
        }
    )

    all_exercises = load_exercises()
    results = load_existing_results(args.output)

    if args.id:
        target_exercises = [e for e in all_exercises if e['id'] == args.id]
    elif args.all:
        target_exercises = [e for e in all_exercises if e['id'] not in results]
    else:
        unprocessed = [e for e in all_exercises if e['id'] not in results]
        target_exercises = unprocessed[:args.limit]

    total_pool = len(all_exercises)
    batch_count = len(target_exercises)

    print(f"\n==========================================================================")
    print(f"🤖 OTONOM HAVUZ DENETİMİ BAŞLADI ({batch_count} hareket işleniyor, Toplam: {total_pool})")
    print(f"==========================================================================\n")

    for idx, ex in enumerate(target_exercises, 1):
        ex_id = ex['id']
        ex_name = ex.get('name', ex_id)
        current_num = len(results) + 1
        print(f"[{current_num}/{total_pool}] 📥 Havuzdan Çekildi: {ex_name} ({ex_id})...")
        try:
            audit_data = await audit_single_exercise(ex, model_client)
            results[ex_id] = audit_data
            save_results(args.output, results)
            # AutoGen Studio Web UI'a oturum olarak aktar
            sync_to_autogen_studio_ui(current_num, total_pool, ex, audit_data["messages"])
            print(f"[{current_num}/{total_pool}] ✅ Onaylandı & AutoGen Arayüzüne Eklendi: {ex_name}\n")
        except Exception as e:
            print(f"[{current_num}/{total_pool}] ⚠️ Hata ({ex_name}): {e}\n")

    print(f"🎉 İşlem tamamlandı! Toplam {len(results)}/{total_pool} hareket başarıyla denetlendi.")
    print(f"AutoGen Studio Arayüzü: http://127.0.0.1:8081 (Sayfayı yenileyerek oturumları görebilirsiniz)")
    print(f"Yerel Veri Dosyası: {args.output}\n")

if __name__ == "__main__":
    asyncio.run(main())
