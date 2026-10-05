#!/usr/bin/env python3
"""
manage_bug_reports.py
Fitness PWA - Firebase Firestore Egzersiz Hata Bildirim Havuzu Yönetim Aracı

Kullanım:
    python3 scripts/manage_bug_reports.py list
    python3 scripts/manage_bug_reports.py get <doc_id>
    python3 scripts/manage_bug_reports.py resolve <doc_id> --note "Görsel ve açıklama güncellendi"
    python3 scripts/manage_bug_reports.py delete <doc_id>
    python3 scripts/manage_bug_reports.py prompt
"""

import sys
import json
import urllib.request
import urllib.error
from datetime import datetime

PROJECT_ID = "fitness-4f427"
FIRESTORE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/exercise_bug_reports"

def parse_firestore_fields(fields):
    data = {}
    for k, v in fields.items():
        if "stringValue" in v:
            data[k] = v["stringValue"]
        elif "integerValue" in v:
            data[k] = int(v["integerValue"])
        elif "doubleValue" in v:
            data[k] = float(v["doubleValue"])
        elif "booleanValue" in v:
            data[k] = v["booleanValue"]
        elif "timestampValue" in v:
            data[k] = v["timestampValue"]
        elif "nullValue" in v:
            data[k] = None
        elif "mapValue" in v:
            data[k] = parse_firestore_fields(v["mapValue"].get("fields", {}))
        elif "arrayValue" in v:
            values = v["arrayValue"].get("values", [])
            data[k] = [val.get("stringValue") or val.get("integerValue") for val in values]
    return data

def to_firestore_fields(data):
    fields = {}
    for k, v in data.items():
        if isinstance(v, str):
            fields[k] = {"stringValue": v}
        elif isinstance(v, bool):
            fields[k] = {"booleanValue": v}
        elif isinstance(v, int):
            fields[k] = {"integerValue": str(v)}
        elif isinstance(v, float):
            fields[k] = {"doubleValue": v}
        elif v is None:
            fields[k] = {"nullValue": None}
    return {"fields": fields}

def list_reports():
    try:
        req = urllib.request.Request(FIRESTORE_URL)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
        
        docs = data.get("documents", [])
        if not docs:
            print("\n✅ Firestore hata havuzunda bekleyen bildirim bulunmuyor.")
            return []

        reports = []
        for doc in docs:
            name = doc.get("name", "")
            doc_id = name.split("/")[-1]
            fields = parse_firestore_fields(doc.get("fields", {}))
            fields["_doc_id"] = doc_id
            fields["_path"] = name
            reports.append(fields)

        print(f"\n📋 Firebase Hata Havuzu ({len(reports)} Bildirim):")
        print("=" * 80)
        for i, r in enumerate(reports, 1):
            ex_id = r.get("exerciseId", "N/A")
            ex_name = r.get("exerciseName", "N/A")
            cat = r.get("categoryLabel") or r.get("category", "N/A")
            status = r.get("status", "pending_ai_review")
            user_note = r.get("userNote", "—")
            created = r.get("createdAt", "")[:19].replace("T", " ")
            print(f"[{i}] ID: {r['_doc_id']}")
            print(f"    Egzersiz : {ex_name} ({ex_id})")
            print(f"    Kategori : {cat}")
            print(f"    Durum    : {status}")
            print(f"    Not      : {user_note}")
            print(f"    Tarih    : {created}")
            print("-" * 80)

        return reports
    except Exception as e:
        print(f"❌ Firestore listeleme hatası: {e}")
        return []

def get_report(doc_id):
    url = f"{FIRESTORE_URL}/{doc_id}"
    try:
        with urllib.request.urlopen(url) as resp:
            data = json.loads(resp.read().decode())
        fields = parse_firestore_fields(data.get("fields", {}))
        print(json.dumps(fields, indent=2, ensure_ascii=False))
        return fields
    except Exception as e:
        print(f"❌ Doküman alınamadı: {e}")
        return None

def resolve_report(doc_id, resolution_note="AI tarafından incelendi ve düzeltildi"):
    url = f"{FIRESTORE_URL}/{doc_id}?updateMask.fieldPaths=status&updateMask.fieldPaths=aiResolutionNote"
    payload = {
        "status": "ai_processed_awaiting_user_ok",
        "aiResolutionNote": resolution_note
    }
    body = json.dumps(to_firestore_fields(payload)).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="PATCH")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"✅ Rapor '{doc_id}' durumu 'ai_processed_awaiting_user_ok' olarak güncellendi.")
            print(f"   Not: {resolution_note}")
    except Exception as e:
        print(f"❌ Güncelleme hatası: {e}")

def delete_report(doc_id):
    url = f"{FIRESTORE_URL}/{doc_id}"
    req = urllib.request.Request(url, method="DELETE")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"🗑️ Rapor '{doc_id}' Firestore havuzundan başarıyla silindi.")
    except Exception as e:
        print(f"❌ Silme hatası: {e}")

def generate_ai_prompt():
    reports = list_reports()
    if not reports:
        print("Bekleyen rapor yok.")
        return
    print("\n🤖 AI İÇİN HAZIR TALİMAT METNİ (Kopyalayabilirsiniz):\n")
    print("----------------------------------------------------------------")
    print("Aşağıdaki egzersiz hata bildirimleri antrenman esnasında kaydedildi. Lütfen kodda ve görsel eşleştirmelerinde gerekli düzeltmeleri yap:\n")
    for r in reports:
        print(f"- Egzersiz: {r.get('exerciseName')} (ID: {r.get('exerciseId')})")
        print(f"  Hata Türü: {r.get('categoryLabel', r.get('category'))}")
        print(f"  Mevcut Görsel: {r.get('currentImageSrc', 'Yok')}")
        print(f"  Kullanıcı Notu: {r.get('userNote', 'Belirtilmedi')}")
        print(f"  Firebase Rapor ID: {r.get('_doc_id')}\n")
    print("Tüm düzeltmeleri tamamladıktan sonra bana rapor ver, benden onay aldıktan sonra bu kayıtları Firebase'den sileceğiz.")
    print("----------------------------------------------------------------\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        list_reports()
        sys.exit(0)

    cmd = sys.argv[1].lower()
    if cmd == "list":
        list_reports()
    elif cmd == "get" and len(sys.argv) > 2:
        get_report(sys.argv[2])
    elif cmd == "resolve" and len(sys.argv) > 2:
        note = "AI tarafından incelendi ve düzeltildi"
        if "--note" in sys.argv:
            idx = sys.argv.index("--note")
            if idx + 1 < len(sys.argv):
                note = sys.argv[idx + 1]
        resolve_report(sys.argv[2], note)
    elif cmd == "delete" and len(sys.argv) > 2:
        delete_report(sys.argv[2])
    elif cmd == "prompt":
        generate_ai_prompt()
    else:
        print("Geçersiz komut. Kullanım: list | get <id> | resolve <id> --note ... | delete <id> | prompt")
