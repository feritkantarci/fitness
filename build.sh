#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "🏋️‍♂️ [1/4] Web ve Mobil Kılavuzlar Derleniyor..."
python3 "$DIR/scripts/build_full_guide.py"

echo "📄 [2/4] Headless Chrome ile 10 Sayfalık PDF Üretiliyor..."
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless \
    --disable-gpu \
    --no-pdf-header-footer \
    --print-to-pdf="$DIR/salon_kilavuzu.pdf" \
    "$DIR/salon_kilavuzu_mobil.html"

echo "☁️ [3/4] iCloud Drive ile Eşitleniyor..."
ICLOUD_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/FITNESS"
if [ -d "$HOME/Library/Mobile Documents/com~apple~CloudDocs" ]; then
    mkdir -p "$ICLOUD_DIR/assets" "$ICLOUD_DIR/docs"
    cp -f "$DIR/salon_kilavuzu.pdf" "$ICLOUD_DIR/"
    cp -f "$DIR/salon_kilavuzu_mobil.html" "$ICLOUD_DIR/"
    cp -f "$DIR/salon_kilavuzu.html" "$ICLOUD_DIR/"
    cp -Rf "$DIR/assets/diagrams" "$ICLOUD_DIR/assets/" 2>/dev/null || true
    cp -f "$DIR/docs/"* "$ICLOUD_DIR/docs/" 2>/dev/null || true
    echo "   ✅ iCloud eşitlendi: $ICLOUD_DIR"
fi

echo "📊 [4/4] Durum:"
ls -lh "$DIR/salon_kilavuzu.pdf" "$DIR/salon_kilavuzu_mobil.html"
echo "🎉 Derleme ve eşitleme başarıyla tamamlandı!"
