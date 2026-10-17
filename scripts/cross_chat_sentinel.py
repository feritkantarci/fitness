#!/usr/bin/env python3
"""
Çelik Kodu (Fitness PWA) - Cross-Chat Sentinel
Tüm konuşma geçmişini (transcripts) tarayarak benzer araştırmaları,
çakışan dosya düzenlemelerini ve ortak kararları tespit eden araç.
"""

import os
import sys
import glob
import json
import argparse
from datetime import datetime

BRAIN_DIR = os.path.expanduser("~/.gemini/antigravity/brain")
WORKSPACE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def is_project_chat(file_path):
    """Konuşmanın bu projeye ait olup olmadığını tespit eder."""
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            for _ in range(25):
                line = f.readline()
                if not line:
                    break
                if WORKSPACE_DIR in line or "celik-kodu" in line.lower() or "celik kodu" in line.lower():
                    return True
                if "FITNESS" in line and "mrkantarci" in line:
                    return True
    except Exception:
        return False
    return False

def parse_transcript(file_path):
    """Transcript dosyasını okuyup istekleri ve dokunulan dosyaları çıkarır."""
    conv_id = file_path.split(os.sep)[-4]
    mtime = os.path.getmtime(file_path)
    
    user_requests = []
    touched_files = set()
    model_summaries = []
    
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                except Exception:
                    continue
                
                source = entry.get("source")
                msg_type = entry.get("type")
                
                # Kullanıcı İstekleri
                if msg_type == "USER_INPUT" or source == "USER_EXPLICIT":
                    content = entry.get("content", "")
                    if "<USER_REQUEST>" in content:
                        req = content.split("<USER_REQUEST>")[1].split("</USER_REQUEST>")[0].strip()
                    else:
                        req = content.strip()
                    if req and req not in user_requests:
                        user_requests.append(req)
                
                # Dokunulan Dosyalar (tool calls)
                tool_calls = entry.get("tool_calls", [])
                for tc in tool_calls:
                    args = tc.get("args", {})
                    # String veya dict olabilir
                    if isinstance(args, str):
                        try:
                            args = json.loads(args)
                        except Exception:
                            args = {}
                    
                    target = args.get("TargetFile") or args.get("AbsolutePath")
                    if target and isinstance(target, str):
                        target = target.strip('"\'')
                        if WORKSPACE_DIR in target:
                            rel_target = os.path.relpath(target, WORKSPACE_DIR)
                            touched_files.add(rel_target)
    except Exception as e:
        pass
        
    return {
        "conv_id": conv_id,
        "mtime": mtime,
        "mtime_str": datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M"),
        "user_requests": user_requests,
        "touched_files": list(touched_files),
        "transcript_path": file_path
    }

def get_all_project_chats():
    """Tüm proje konuşmalarını mtime sırasıyla döndürür."""
    results = []
    pattern = os.path.join(BRAIN_DIR, "*", ".system_generated", "logs", "transcript.jsonl")
    for p in glob.glob(pattern):
        if is_project_chat(p):
            parsed = parse_transcript(p)
            if parsed["user_requests"] or parsed["touched_files"]:
                results.append(parsed)
    results.sort(key=lambda x: x["mtime"], reverse=True)
    return results

def search_query(chats, query):
    """Anahtar kelime araması yapar."""
    q = query.lower()
    matches = []
    for c in chats:
        matched_reqs = [r for r in c["user_requests"] if q in r.lower()]
        matched_files = [f for f in c["touched_files"] if q in f.lower()]
        if matched_reqs or matched_files:
            matches.append({
                "chat": c,
                "matched_reqs": matched_reqs,
                "matched_files": matched_files
            })
    return matches

def check_file_conflicts(chats, filename):
    """Belirli bir dosyanın hangi konuşmalarda düzenlendiğini bulur."""
    f_clean = os.path.basename(filename).lower()
    conflicts = []
    for c in chats:
        matching = [f for f in c["touched_files"] if f_clean in f.lower()]
        if matching:
            conflicts.append({
                "chat": c,
                "files": matching
            })
    return conflicts

def main():
    parser = argparse.ArgumentParser(description="Çelik Kodu Cross-Chat Sentinel")
    parser.add_argument("--query", "-q", help="Konuşmalarda benzer konu/kelime ara")
    parser.add_argument("--file", "-f", help="Bir dosyanın hangi konuşmalarda düzenlendiğini denetle")
    parser.add_argument("--recent", "-r", type=int, default=5, help="Son N konuşmayı listele")
    parser.add_argument("--json", action="store_true", help="JSON formatında çıktı ver")
    args = parser.parse_args()

    chats = get_all_project_chats()

    if args.file:
        conflicts = check_file_conflicts(chats, args.file)
        if args.json:
            print(json.dumps(conflicts, ensure_ascii=False, indent=2))
        else:
            print(f"\n📁 [DOSYA KONTROLÜ] '{args.file}' ile etkileşime giren konuşmalar ({len(conflicts)} adet):")
            for item in conflicts[:5]:
                c = item["chat"]
                first_req = c["user_requests"][0] if c["user_requests"] else "Bilinmiyor"
                print(f"- 🕒 {c['mtime_str']} | ID: {c['conv_id'][:8]}")
                print(f"  Konu: {first_req[:90]}...")
                print(f"  Dosyalar: {', '.join(item['files'])}")
        return

    if args.query:
        matches = search_query(chats, args.query)
        if args.json:
            print(json.dumps(matches, ensure_ascii=False, indent=2))
        else:
            print(f"\n🔍 [ÇAPRAZ ARAMA] '{args.query}' ile eşleşen konuşmalar ({len(matches)} adet):")
            for item in matches[:5]:
                c = item["chat"]
                print(f"- 🕒 {c['mtime_str']} | ID: {c['conv_id'][:8]}")
                for req in item["matched_reqs"][:2]:
                    print(f"  Talep: {req[:100]}...")
                if item["matched_files"]:
                    print(f"  Dosyalar: {', '.join(item['matched_files'][:3])}")
        return

    # Varsayılan: Son N konuşmayı listele
    recent_chats = chats[:args.recent]
    if args.json:
        print(json.dumps(recent_chats, ensure_ascii=False, indent=2))
    else:
        print(f"\n📡 [SENTINEL AKTİF] Projedeki Son {len(recent_chats)} Konuşma:")
        for c in recent_chats:
            first_req = c["user_requests"][0] if c["user_requests"] else "İstek bulunamadı"
            files_count = len(c["touched_files"])
            print(f"- 🕒 {c['mtime_str']} | ID: [{c['conv_id'][:8]}]")
            print(f"  İlk İstek: {first_req[:100]}...")
            if files_count > 0:
                print(f"  İlgili Dosyalar ({files_count}): {', '.join(c['touched_files'][:3])}")

if __name__ == "__main__":
    main()
