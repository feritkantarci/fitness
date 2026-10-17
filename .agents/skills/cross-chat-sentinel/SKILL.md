---
name: cross-chat-sentinel
description: Projedeki tüm konuşmalar (chat'ler) arasında bağlantı kurarak mükerrer araştırmaları, çakışan dosya düzenlemelerini ve ortak mimari kararları tespit eden çapraz gözcü becerisi.
---

# Cross-Chat Sentinel (Çapraz Oturum Gözcüsü)

Bu beceri, Çelik Kodu projesinde açılmış olan geçmiş ve paralel tüm konuşmaları (`brain` transcript loglarını) tarayarak ekipler/oturumlar arası çakışmayı ve gereksiz iş tekrarını önler.

## Ne Zaman Kullanılır?
- Yeni bir araştırma veya analiz yapmadan önce (daha önce incelendi mi kontrolü).
- Kritik dosyalarda (`index.html`, `js/exercises-db.js`, `sw.js` vb.) değişiklik yapmadan önce (diğer chat'lerle çakışma kontrolü).
- "Bu konuyu daha önce konuşmuş muyduk?" veya "X dosyasını kim değiştirdi?" sorularında.

## Hızlı Komutlar
1. **Konu / İstek Araması:**
   ```bash
   python3 scripts/cross_chat_sentinel.py --query "aranacak kelime veya konu"
   ```

2. **Dosya Çakışma Denetimi:**
   ```bash
   python3 scripts/cross_chat_sentinel.py --file "exercises-db.js"
   ```

3. **Son Aktif Konuşmaları İnceleme:**
   ```bash
   python3 scripts/cross_chat_sentinel.py --recent 5
   ```

## Çıktı İlkeleri
- En fazla 5 ilgili konuşma listelenir.
- Tarih, Chat ID ve ilk kullanıcı isteği gösterilir.
- Çakışma riski varsa ilgili dosya isimleri açıkça vurgulanır.
