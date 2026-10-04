import os

# Helper for dumbbell SVG
def db(x, y, angle=0, scale=1.0):
    return f'''<g transform="translate({x},{y}) rotate({angle}) scale({scale})">
        <rect x="-8" y="-2.5" width="16" height="5" rx="1.5" fill="#fde68a"/>
        <rect x="-13" y="-7" width="5.5" height="14" rx="2" fill="url(#goldGrad)" stroke="#b45309" stroke-width="0.5"/>
        <rect x="7.5" y="-7" width="5.5" height="14" rx="2" fill="url(#goldGrad)" stroke="#b45309" stroke-width="0.5"/>
    </g>'''

def ground(y=45):
    return f'<line x1="-75" y1="{y}" x2="75" y2="{y}" stroke="#334155" stroke-width="2" stroke-dasharray="4,4" stroke-linecap="round"/>'

def create_sequence_svg(filename, title, panels):
    num_panels = len(panels)
    width = 240 * num_panels + 18 * (num_panels - 1) + 24
    height = 230
    
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="auto" style="background:#090d16; border-radius:12px; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">']
    
    svg.append('''<defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
        <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#0284c7"/>
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#94a3b8"/>
        </linearGradient>
        <marker id="arrowCyan" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8"/>
        </marker>
        <marker id="arrowGold" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b"/>
        </marker>
        <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#10b981"/>
        </marker>
    </defs>''')
    
    for i, p in enumerate(panels):
        x_offset = 12 + i * 258
        badge_color = p.get('badge_color', '#38bdf8')
        badge_text = p.get('badge_text', f'ADIM {i+1}')
        caption = p.get('caption', '')
        subcaption = p.get('subcaption', '')
        drawing = p.get('drawing', '')
        
        svg.append(f'''
        <g transform="translate({x_offset}, 10)">
            <!-- Card background -->
            <rect width="240" height="210" rx="10" fill="#131c2e" stroke="#25334d" stroke-width="1.5"/>
            <!-- Badge -->
            <rect x="12" y="10" width="105" height="22" rx="4" fill="{badge_color}" fill-opacity="0.15" stroke="{badge_color}" stroke-width="1"/>
            <text x="64" y="25" fill="{badge_color}" font-size="10.5" font-weight="800" text-anchor="middle" letter-spacing="0.5">{badge_text}</text>
            
            <!-- Graphic canvas area -->
            <g transform="translate(120, 95)">
                {drawing}
            </g>
            
            <!-- Step label & caption -->
            <text x="120" y="176" fill="#f8fafc" font-size="11.5" font-weight="700" text-anchor="middle">{caption}</text>
            <text x="120" y="195" fill="#94a3b8" font-size="10" font-weight="500" text-anchor="middle">{subcaption}</text>
        </g>
        ''')
        
        if i < num_panels - 1:
            arrow_x = x_offset + 241
            svg.append(f'''
            <g transform="translate({arrow_x}, 105)">
                <circle cx="8" cy="0" r="9" fill="#1e293b" stroke="#334155" stroke-width="1"/>
                <path d="M6,-3 L10,0 L6,3" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            ''')
            
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(SCRIPT_DIR) if os.path.basename(SCRIPT_DIR) == 'scripts' else SCRIPT_DIR
    full_path = os.path.join(PROJECT_ROOT, filename)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(svg))
    print(f"Generated {full_path}")

# ==========================================
# GÜN 1 EGZERSİZLERİ
# ==========================================

# 1. Çift Dambıl Omuz Presi (Overhead Press)
p1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Omuzda Hazır Duruş', 'subcaption': 'Dirsekler 45° önde, karın sıkı',
    'drawing': f'''
        {ground(48)}
        <!-- Legs -->
        <line x1="-10" y1="45" x2="-6" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="10" y1="45" x2="6" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <!-- Torso -->
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <!-- Head -->
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <!-- Arms at shoulders -->
        <polyline points="-16,-12 -18,-18 -12,-22" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" fill="none"/>
        <polyline points="16,-12 18,-18 12,-22" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" fill="none"/>
        <!-- Dumbbells -->
        {db(-18, -22, 0)}
        {db(18, -22, 0)}
    '''
}
p2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Dikey İtiş Yükselişi', 'subcaption': 'Dirsekler açılmadan dikey pres',
    'drawing': f'''
        {ground(48)}
        <line x1="-10" y1="45" x2="-6" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="10" y1="45" x2="6" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <!-- Arms extending up -->
        <polyline points="-12,-20 -15,-38 -15,-45" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" fill="none"/>
        <polyline points="12,-20 15,-38 15,-45" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" fill="none"/>
        <!-- Arrows -->
        <path d="M-22,-25 L-22,-45" stroke="#38bdf8" stroke-width="2" stroke-dasharray="2,2" marker-end="url(#arrowCyan)"/>
        <path d="M22,-25 L22,-45" stroke="#38bdf8" stroke-width="2" stroke-dasharray="2,2" marker-end="url(#arrowCyan)"/>
        {db(-15, -45, 0)}
        {db(15, -45, 0)}
    '''
}
p3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Baş Üstü Tam Kilit', 'subcaption': 'Kollar kulak yanında, omurga nötr',
    'drawing': f'''
        {ground(48)}
        <line x1="-10" y1="45" x2="-6" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="10" y1="45" x2="6" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <!-- Arms fully locked overhead -->
        <line x1="-8" y1="-20" x2="-10" y2="-55" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        <line x1="8" y1="-20" x2="10" y2="-55" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        <!-- Lockout glow -->
        <circle cx="0" cy="-55" r="16" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/>
        {db(-10, -56, 0)}
        {db(10, -56, 0)}
    '''
}
create_sequence_svg('assets/diagrams/seq_db_press.svg', 'Çift Dambıl Omuz Presi', [p1, p2, p3])

# 2. Dikey Goblet Squat
s1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Dikey Goblet Tutuş', 'subcaption': 'Dambıl göğüste, ayaklar omuz hizasında',
    'drawing': f'''
        {ground(48)}
        <line x1="-12" y1="45" x2="-8" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="12" y1="45" x2="8" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <polyline points="-12,-18 -4,-16 0,-18" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" fill="none"/>
        <polyline points="12,-18 4,-16 0,-18" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" fill="none"/>
        {db(0, -18, 90, 1.2)}
    '''
}
s2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Kontrollü İniş (3 sn)', 'subcaption': 'Kalça geriye, dizler parmak yönünde',
    'drawing': f'''
        {ground(48)}
        <polyline points="-14,45 -22,25 -8,16" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="14,45 22,25 8,16" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="16" x2="-2" y2="-12" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="-2" cy="-24" r="9" fill="#cbd5e1"/>
        <path d="M-28,10 Q-32,24 -28,34" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2,2" marker-end="url(#arrowGold)" fill="none"/>
        {db(-2, -8, 90, 1.2)}
    '''
}
s3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Dip Nokta & Topuk İtişi', 'subcaption': 'Paralelin altında dik göğüs, tam kalkış',
    'drawing': f'''
        {ground(48)}
        <polyline points="-16,45 -30,30 -6,28" stroke="#10b981" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="16,45 30,30 6,28" stroke="#10b981" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="28" x2="0" y2="4" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-8" r="9" fill="#cbd5e1"/>
        <!-- Push up arrow -->
        <path d="M-36,36 L-36,18" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrowGreen)"/>
        {db(0, 8, 90, 1.2)}
    '''
}
create_sequence_svg('assets/diagrams/seq_db_squat.svg', 'Dikey Dambıl Goblet Squat', [s1, s2, s3])

# 3. Dambıl Hang Clean to Front Squat (4 Adımlı!)
c1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Diz Hizası Hang Asılış', 'subcaption': 'Kalça arkada, göğüs açık, kollar serbest',
    'drawing': f'''
        {ground(48)}
        <polyline points="-10,45 -14,24 -4,14" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="10,45 14,24 4,14" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="14" x2="-14" y2="-12" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="-16" cy="-24" r="9" fill="#cbd5e1"/>
        <line x1="-12" y1="-8" x2="-10" y2="18" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        {db(-10, 20, 0)}
    '''
}
c2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. PATLAYICI İTİŞ',
    'caption': 'Kalça Fırlatması & Silkme', 'subcaption': 'Kalça menteşesiyle dambıllar uçar',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <polyline points="-10,-18 -18,-14 -12,-6" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M-14,14 L-14,-10" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrowGold)"/>
        {db(-14, -6, 20)}
    '''
}
c3 = {
    'badge_color': '#a855f7', 'badge_text': '3. RACK YAKALAMA',
    'caption': 'Omuzda Yumuşak Karşılama', 'subcaption': 'Dirsekler önde, dambıllar omuza oturur',
    'drawing': f'''
        {ground(48)}
        <polyline points="-10,45 -14,24 -4,14" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="10,45 14,24 4,14" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="14" x2="0" y2="-18" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-30" r="9" fill="#cbd5e1"/>
        <polyline points="-10,-14 -16,-18 -12,-20" stroke="#a855f7" stroke-width="5" stroke-linecap="round" fill="none"/>
        {db(-14, -20, 0)}
        {db(14, -20, 0)}
    '''
}
c4 = {
    'badge_color': '#10b981', 'badge_text': '4. FRONT SQUAT',
    'caption': 'Derin Squat & Kalkış', 'subcaption': 'Tam derinlikten patlayıcı doğrulma',
    'drawing': f'''
        {ground(48)}
        <polyline points="-16,45 -28,30 -6,28" stroke="#10b981" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="16,45 28,30 6,28" stroke="#10b981" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="28" x2="0" y2="4" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-8" r="9" fill="#cbd5e1"/>
        <path d="M-34,36 L-34,16" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrowGreen)"/>
        {db(-14, 2, 0)}
        {db(14, 2, 0)}
    '''
}
create_sequence_svg('assets/diagrams/seq_db_clean_squat.svg', 'Dambıl Hang Clean to Front Squat', [c1, c2, c3, c4])

# 4. Hand-Release Push-Up
pu1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Yüksek Plank Pozisyonu', 'subcaption': 'Vücut tek parça tahta, eller omuz altında',
    'drawing': f'''
        {ground(35)}
        <!-- Feet to shoulder plank line -->
        <line x1="-50" y1="33" x2="20" y2="12" stroke="url(#bodyGrad)" stroke-width="10" stroke-linecap="round"/>
        <circle cx="28" cy="8" r="8" fill="#cbd5e1"/>
        <!-- Arms -->
        <line x1="16" y1="14" x2="16" y2="33" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
    '''
}
pu2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Göğüs Yerde, Eller Havada', 'subcaption': '1 sn el kaldırılır (momentumu sıfırla)',
    'drawing': f'''
        {ground(35)}
        <!-- Body flat on ground -->
        <line x1="-50" y1="32" x2="20" y2="32" stroke="url(#bodyGrad)" stroke-width="10" stroke-linecap="round"/>
        <circle cx="28" cy="28" r="8" fill="#cbd5e1"/>
        <!-- Hands raised up -->
        <polyline points="14,32 18,22 22,20" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M22,26 L22,16" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowGold)"/>
    '''
}
pu3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Patlayıcı İtiş & Kilit', 'subcaption': 'Bel düşürülmeden tek parça kilitlenme',
    'drawing': f'''
        {ground(35)}
        <line x1="-50" y1="33" x2="20" y2="12" stroke="#10b981" stroke-width="10" stroke-linecap="round"/>
        <circle cx="28" cy="8" r="8" fill="#cbd5e1"/>
        <line x1="16" y1="14" x2="16" y2="33" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        <path d="M0,28 L0,12" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrowGreen)"/>
    '''
}
create_sequence_svg('assets/diagrams/seq_pushup.svg', 'Hand-Release Push-Up', [pu1, pu2, pu3])

# 5. Dambıl Yan Omuz Açış (Lateral Raise)
lat1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Bacak Yanında Duruş', 'subcaption': 'Dirsekler hafif bükük, dik gövde',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <polyline points="-10,-18 -14,-2 -16,4" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" fill="none"/>
        <polyline points="10,-18 14,-2 16,4" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" fill="none"/>
        {db(-18, 5, 0)}
        {db(18, 5, 0)}
    '''
}
lat2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Yana Kontrollü Açış', 'subcaption': 'Dirsekler öncülük eder, omuz sıkışmaz',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <polyline points="-10,-18 -26,-16 -36,-10" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/>
        <polyline points="10,-18 26,-16 36,-10" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M-22,2 Q-32,-4 -36,-8" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowGold)" fill="none"/>
        <path d="M22,2 Q32,-4 36,-8" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowGold)" fill="none"/>
        {db(-38, -10, -15)}
        {db(38, -10, 15)}
    '''
}
lat3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Omuz Hizası Zirve Tutuş', 'subcaption': '1 sn tepe sıkıştırma, boyun serbest',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <polyline points="-10,-18 -32,-20 -44,-22" stroke="#10b981" stroke-width="5" stroke-linecap="round" fill="none"/>
        <polyline points="10,-18 32,-20 44,-22" stroke="#10b981" stroke-width="5" stroke-linecap="round" fill="none"/>
        {db(-46, -22, 0)}
        {db(46, -22, 0)}
    '''
}
create_sequence_svg('assets/diagrams/seq_lateral_raise.svg', 'Dambıl Yan Omuz Açış', [lat1, lat2, lat3])

# 6. Floor Leg Raise
lr1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Zeminde Düz Sırtüstü', 'subcaption': 'Bel çukuru yere kilitli, eller kalça yanında',
    'drawing': f'''
        {ground(35)}
        <line x1="-40" y1="32" x2="30" y2="32" stroke="url(#bodyGrad)" stroke-width="10" stroke-linecap="round"/>
        <circle cx="38" cy="28" r="8" fill="#cbd5e1"/>
        <line x1="-40" y1="32" x2="-55" y2="32" stroke="#64748b" stroke-width="7" stroke-linecap="round"/>
    '''
}
lr2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Bacakları 60° Kaldırma', 'subcaption': 'Dizler düz, karın kasıyla yukarı çekiş',
    'drawing': f'''
        {ground(35)}
        <line x1="-15" y1="32" x2="30" y2="32" stroke="url(#bodyGrad)" stroke-width="10" stroke-linecap="round"/>
        <circle cx="38" cy="28" r="8" fill="#cbd5e1"/>
        <line x1="-15" y1="32" x2="-45" y2="5" stroke="#f59e0b" stroke-width="7" stroke-linecap="round"/>
        <path d="M-40,28 Q-48,22 -44,10" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowGold)" fill="none"/>
    '''
}
lr3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Yavaş İndiriş (Topuk 5 cm)', 'subcaption': 'Yere değmeden dur, beli yerden kaldırma',
    'drawing': f'''
        {ground(35)}
        <line x1="-15" y1="32" x2="30" y2="32" stroke="#10b981" stroke-width="10" stroke-linecap="round"/>
        <circle cx="38" cy="28" r="8" fill="#cbd5e1"/>
        <line x1="-15" y1="32" x2="-55" y2="22" stroke="#10b981" stroke-width="7" stroke-linecap="round"/>
        <path d="M-45,12 L-45,20" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>
    '''
}
create_sequence_svg('assets/diagrams/seq_leg_raise.svg', 'Zemin Bacak İndirme & Kaldırma', [lr1, lr2, lr3])


# ==========================================
# GÜN 2 EGZERSİZLERİ
# ==========================================

# 7. Tek Kol Dambıl Testere Çekiş (Row)
r1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Düz Sırt & Sarkıtma', 'subcaption': 'Gövde 45°, dambıl omuz altında serbest',
    'drawing': f'''
        {ground(48)}
        <polyline points="-18,45 -22,24 -8,12" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="8,45 12,24 2,12" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="-3" y1="12" x2="22" y2="-6" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="30" cy="-12" r="9" fill="#cbd5e1"/>
        <line x1="16" y1="-2" x2="16" y2="28" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        {db(16, 30, 90)}
    '''
}
r2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Kalça Cebine Çekiş', 'subcaption': 'Dirsek geriye doğru yönlendirilir',
    'drawing': f'''
        {ground(48)}
        <polyline points="-18,45 -22,24 -8,12" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="8,45 12,24 2,12" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="-3" y1="12" x2="22" y2="-6" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="30" cy="-12" r="9" fill="#cbd5e1"/>
        <polyline points="16,-2 8,10 6,18" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M18,26 Q12,18 8,8" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrowGold)" fill="none"/>
        {db(6, 18, 90)}
    '''
}
r3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Zirve Lat Sıkıştırma', 'subcaption': 'Dirsek kaburgaya yapışık, gövde dönmez',
    'drawing': f'''
        {ground(48)}
        <polyline points="-18,45 -22,24 -8,12" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="8,45 12,24 2,12" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="-3" y1="12" x2="22" y2="-6" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="30" cy="-12" r="9" fill="#cbd5e1"/>
        <polyline points="16,-2 2,-8 2,4" stroke="#10b981" stroke-width="5" stroke-linecap="round" fill="none"/>
        <!-- Lat glow -->
        <circle cx="4" cy="2" r="14" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/>
        {db(2, 6, 90)}
    '''
}
create_sequence_svg('assets/diagrams/seq_db_row.svg', 'Tek Kol Dambıl Testere Çekiş', [r1, r2, r3])

# 8. Çift Dambıl Romanian Deadlift (RDL)
rd1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Ayakta Dik Duruş', 'subcaption': 'Dambıllar uyluk önünde yapışık, dik göğüs',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <line x1="-6" y1="-18" x2="-6" y2="5" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        {db(-6, 6, 0)}
    '''
}
rd2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Kalçayı Arkaya İtme', 'subcaption': 'Dizler hafif kırık, ağırlık bacağa yapışık',
    'drawing': f'''
        {ground(48)}
        <polyline points="-12,45 -16,24 -4,14" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="12,45 16,24 4,14" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="14" x2="22" y2="2" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="30" cy="-4" r="9" fill="#cbd5e1"/>
        <!-- Hip arrow pointing back -->
        <path d="M-8,14 L-26,14" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrowGold)"/>
        <line x1="16" y1="4" x2="16" y2="22" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        {db(16, 24, 0)}
    '''
}
rd3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Kaval Kemiği & Hamstring', 'subcaption': 'Tam gerilim, topuktan iterek doğrulma',
    'drawing': f'''
        {ground(48)}
        <polyline points="-12,45 -16,24 -4,14" stroke="#10b981" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="12,45 16,24 4,14" stroke="#10b981" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="14" x2="26" y2="8" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="34" cy="2" r="9" fill="#cbd5e1"/>
        <line x1="18" y1="8" x2="18" y2="34" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        <!-- Upward return arrow -->
        <path d="M-2,10 L-2,-5" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrowGreen)"/>
        {db(18, 36, 0)}
    '''
}
create_sequence_svg('assets/diagrams/seq_db_rdl.svg', 'Çift Dambıl Romanian Deadlift', [rd1, rd2, rd3])

# 9. Dambıl Swing
sw1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Bacak Arası Menteşe', 'subcaption': 'Kalça geride, dambıl dik bacak arasında',
    'drawing': f'''
        {ground(48)}
        <polyline points="-14,45 -18,25 -6,14" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="14,45 18,25 6,14" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="14" x2="22" y2="0" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="30" cy="-6" r="9" fill="#cbd5e1"/>
        <line x1="16" y1="2" x2="4" y2="22" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        {db(4, 24, 90, 1.1)}
    '''
}
sw2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Patlayıcı Kalça Vuruşu', 'subcaption': 'Glute kasılıp kalça öne fırlatılır',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="4" y2="-20" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="6" cy="-32" r="9" fill="#cbd5e1"/>
        <!-- Hip forward explosive snap -->
        <path d="M-6,14 L12,14" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrowGold)"/>
        <line x1="8" y1="-16" x2="26" y2="-2" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        {db(28, 0, 45, 1.1)}
    '''
}
sw3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Göğüs Hizası Tahta Plank', 'subcaption': 'Kollar gevşek halat, popo ve karın taş gibi',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="#10b981" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <!-- Arms horizontal holding float -->
        <line x1="4" y1="-18" x2="38" y2="-18" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        {db(42, -18, 90, 1.1)}
        <!-- Float glow -->
        <circle cx="42" cy="-18" r="16" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/>
    '''
}
create_sequence_svg('assets/diagrams/seq_db_swing.svg', 'Çift Elle Dambıl Swing', [sw1, sw2, sw3])

# 10. Dambıl Renegade Row (Plank Kürek)
rr1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Dambıl Üstü Plank', 'subcaption': 'Geniş ayak tabanı, karın kilitli',
    'drawing': f'''
        {ground(35)}
        <line x1="-50" y1="33" x2="20" y2="12" stroke="url(#bodyGrad)" stroke-width="10" stroke-linecap="round"/>
        <circle cx="28" cy="8" r="8" fill="#cbd5e1"/>
        <line x1="16" y1="14" x2="16" y2="30" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        {db(16, 32, 90)}
    '''
}
rr2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Gövdeyi Döndürmeden Çekiş', 'subcaption': 'Tek dambıl kaburga yanına çekilir',
    'drawing': f'''
        {ground(35)}
        <line x1="-50" y1="33" x2="20" y2="12" stroke="url(#bodyGrad)" stroke-width="10" stroke-linecap="round"/>
        <circle cx="28" cy="8" r="8" fill="#cbd5e1"/>
        <!-- One arm supporting on ground -->
        <line x1="20" y1="14" x2="20" y2="30" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
        {db(20, 32, 90)}
        <!-- Row arm pulled up -->
        <polyline points="12,14 6,2 6,10" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M4,24 L4,10" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowGold)"/>
        {db(6, 10, 90)}
    '''
}
rr3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Zirve Sıkıştırma & Diğer Kol', 'subcaption': 'Kalça yere paralel, kontrollü iniş',
    'drawing': f'''
        {ground(35)}
        <line x1="-50" y1="33" x2="20" y2="12" stroke="#10b981" stroke-width="10" stroke-linecap="round"/>
        <circle cx="28" cy="8" r="8" fill="#cbd5e1"/>
        <line x1="16" y1="14" x2="16" y2="30" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        {db(16, 32, 90)}
        <circle cx="-10" cy="18" r="14" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/>
    '''
}
create_sequence_svg('assets/diagrams/seq_renegade_row.svg', 'Dambıl Renegade Row', [rr1, rr2, rr3])

# 11. Dambıl Overhead Carry
oc1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Baş Üstü Kilitlenme', 'subcaption': 'Tek dambıl kulak hizasında tam kilitli',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <line x1="8" y1="-20" x2="10" y2="-55" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
        {db(10, -56, 0)}
    '''
}
oc2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Dik ve Ritmik Adımlar', 'subcaption': 'Kaburga içeri, omuz ve dirsek kıpırdamaz',
    'drawing': f'''
        {ground(48)}
        <polyline points="-12,45 -8,25 -2,10" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="14,45 8,25 2,10" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <line x1="8" y1="-20" x2="10" y2="-55" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
        <path d="M-20,40 L-6,40" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowGold)"/>
        {db(10, -56, 0)}
    '''
}
oc3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Kontrollü İndiriş & Diğer Kol', 'subcaption': 'Omuza yumuşak indir, taraf değiştir',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="#10b981" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <polyline points="8,-20 14,-22 10,-24" stroke="#10b981" stroke-width="5" stroke-linecap="round" fill="none"/>
        {db(10, -24, 0)}
    '''
}
create_sequence_svg('assets/diagrams/seq_overhead_carry.svg', 'Dambıl Overhead Carry', [oc1, oc2, oc3])

# 12. Dambıl Rus Dönüşü (Russian Twist)
rt1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'V-Oturuş Denge Pozisyonu', 'subcaption': 'Dizler kırık, dambıl göğüs önünde merkezde',
    'drawing': f'''
        {ground(35)}
        <polyline points="-40,32 -25,18 -10,32" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="-10" y1="32" x2="16" y2="10" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="22" cy="2" r="8" fill="#cbd5e1"/>
        <polyline points="10,14 4,18 0,22" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" fill="none"/>
        {db(0, 22, 0)}
    '''
}
rt2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Gövde Rotasyonu (Sağa)', 'subcaption': 'Kollarla değil, omurgayı çevirerek',
    'drawing': f'''
        {ground(35)}
        <polyline points="-40,32 -25,18 -10,32" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="-10" y1="32" x2="16" y2="10" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="22" cy="2" r="8" fill="#cbd5e1"/>
        <polyline points="10,14 16,22 18,28" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M-4,16 Q8,22 14,26" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowGold)" fill="none"/>
        {db(18, 28, 45)}
    '''
}
rt3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Merkeze Dönüş & Sola Rotasyon', 'subcaption': 'Oblik kasları kilitli, ritmik tempo',
    'drawing': f'''
        {ground(35)}
        <polyline points="-40,32 -25,18 -10,32" stroke="#10b981" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="-10" y1="32" x2="16" y2="10" stroke="#10b981" stroke-width="12" stroke-linecap="round"/>
        <circle cx="22" cy="2" r="8" fill="#cbd5e1"/>
        <polyline points="10,14 -4,22 -8,28" stroke="#10b981" stroke-width="5" stroke-linecap="round" fill="none"/>
        {db(-8, 28, -45)}
    '''
}
create_sequence_svg('assets/diagrams/seq_russian_twist.svg', 'Dambıl Rus Dönüşü', [rt1, rt2, rt3])


# ==========================================
# GÜN 3 EGZERSİZLERİ
# ==========================================

# 13. Tek Kol Dambıl Hang Snatch
sn1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Diz Üstü Hang Asılış', 'subcaption': 'Kalça geride, dambıl diz hizasında',
    'drawing': f'''
        {ground(48)}
        <polyline points="-12,45 -16,24 -4,14" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="12,45 16,24 4,14" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="14" x2="-14" y2="-12" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="-16" cy="-24" r="9" fill="#cbd5e1"/>
        <line x1="-12" y1="-8" x2="-8" y2="16" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        {db(-8, 18, 0)}
    '''
}
sn2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Dikey Patlama & Fırlatma', 'subcaption': 'Vücuda yapışık düz hat boyunca uçar',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <polyline points="-8,-18 -12,-30 -8,-36" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M-8,14 L-8,-30" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrowGold)"/>
        {db(-8, -36, 0)}
    '''
}
sn3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Baş Üstü Anında Kilit', 'subcaption': 'Kol tam kilitli, dimdik karşılama',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="#10b981" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <line x1="-8" y1="-20" x2="-8" y2="-55" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        <circle cx="-8" cy="-55" r="16" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/>
        {db(-8, -56, 0)}
    '''
}
create_sequence_svg('assets/diagrams/seq_db_snatch.svg', 'Tek Kol Dambıl Hang Snatch', [sn1, sn2, sn3])

# 14. Dambıl Yürüyüş Lunge (Walking Lunge)
lu1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Ayakta Dik Duruş', 'subcaption': 'Dambıllar yanlarda sarkık, omuzlar geride',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <line x1="-12" y1="-18" x2="-14" y2="5" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        {db(-14, 6, 0)}
        {db(14, 6, 0)}
    '''
}
lu2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Öne Büyük Adım & İniş', 'subcaption': 'Gövde dik eksende iner, ön diz 90°',
    'drawing': f'''
        {ground(48)}
        <!-- Front leg stepping out -->
        <polyline points="28,45 28,26 8,16" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <!-- Rear leg bending down -->
        <polyline points="-30,45 -22,40 -8,16" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="16" x2="0" y2="-16" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-28" r="9" fill="#cbd5e1"/>
        <path d="M0,8 L0,22" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowGold)"/>
        {db(-10, 18, 0)}
        {db(10, 18, 0)}
    '''
}
lu3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Dip Nokta (Arka Diz 2 cm)', 'subcaption': 'Ön topuktan iterek doğrul ve adımı tamamla',
    'drawing': f'''
        {ground(48)}
        <polyline points="28,45 28,26 8,24" stroke="#10b981" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="-32,45 -22,43 -8,24" stroke="#10b981" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="24" x2="0" y2="-8" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-20" r="9" fill="#cbd5e1"/>
        <path d="M28,24 L28,8" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrowGreen)"/>
        {db(-10, 24, 0)}
        {db(10, 24, 0)}
    '''
}
create_sequence_svg('assets/diagrams/seq_db_lunge.svg', 'Dambıl Yürüyüş Lunge', [lu1, lu2, lu3])

# 15. Merdiven Kompleksi (Escalera: Row -> Clean -> Squat -> Snatch) 4 Adım!
es1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. TESTERE ÇEKİŞ',
    'caption': 'Düz Sırtla Çekiş', 'subcaption': 'Dirsek geriye, lat kasılması',
    'drawing': f'''
        {ground(48)}
        <polyline points="-14,45 -18,24 -4,14" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="14" x2="22" y2="0" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="30" cy="-6" r="9" fill="#cbd5e1"/>
        <polyline points="16,2 6,8 6,18" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" fill="none"/>
        {db(6, 18, 90)}
    '''
}
es2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. HANG CLEAN',
    'caption': 'Omuza Patlayıcı Alış', 'subcaption': 'Kalça itişiyle rack pozisyonu',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <polyline points="-8,-18 -14,-22 -10,-24" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/>
        {db(-10, -24, 0)}
    '''
}
es3 = {
    'badge_color': '#a855f7', 'badge_text': '3. FRONT SQUAT',
    'caption': 'Dambıl Omuzda Derin Çömelme', 'subcaption': 'Göğüs dik, tam derinlik',
    'drawing': f'''
        {ground(48)}
        <polyline points="-16,45 -28,30 -6,28" stroke="#a855f7" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="16,45 28,30 6,28" stroke="#a855f7" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="28" x2="0" y2="4" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-8" r="9" fill="#cbd5e1"/>
        {db(-10, 2, 0)}
    '''
}
es4 = {
    'badge_color': '#10b981', 'badge_text': '4. KOPARMA / PRES',
    'caption': 'Baş Üstü Kilitleniş', 'subcaption': 'Kalkarken momentumla bitiriş',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="#10b981" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <line x1="-8" y1="-20" x2="-8" y2="-55" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        <circle cx="-8" cy="-55" r="16" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/>
        {db(-8, -56, 0)}
    '''
}
create_sequence_svg('assets/diagrams/seq_escalera.svg', 'La Forja Merdiven Kompleksi', [es1, es2, es3, es4])

# 16. Dambıl Zemin Presi (Floor Press)
fp1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Sırtüstü Yatış & Dirsek Yerde', 'subcaption': 'Dirsekler yerde 45°, dambıllar göğüs üstünde',
    'drawing': f'''
        {ground(35)}
        <line x1="-35" y1="32" x2="25" y2="32" stroke="url(#bodyGrad)" stroke-width="10" stroke-linecap="round"/>
        <circle cx="33" cy="28" r="8" fill="#cbd5e1"/>
        <!-- Bent knees -->
        <polyline points="-35,32 -25,18 -15,32" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <!-- Triceps on floor -->
        <polyline points="15,32 10,24 8,14" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" fill="none"/>
        {db(8, 12, 0)}
    '''
}
fp2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Tavana Doğru Patlayıcı İtiş', 'subcaption': 'Dirsekler yerden kalkar, göğüs kasılır',
    'drawing': f'''
        {ground(35)}
        <line x1="-35" y1="32" x2="25" y2="32" stroke="url(#bodyGrad)" stroke-width="10" stroke-linecap="round"/>
        <circle cx="33" cy="28" r="8" fill="#cbd5e1"/>
        <polyline points="-35,32 -25,18 -15,32" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="15" y1="30" x2="15" y2="2" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
        <path d="M6,22 L6,8" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowGold)"/>
        {db(15, 0, 0)}
    '''
}
fp3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Tepe Kilit & 3 sn İniş', 'subcaption': 'Göğüs maksimum sıkılır, dirsek kontrollü değer',
    'drawing': f'''
        {ground(35)}
        <line x1="-35" y1="32" x2="25" y2="32" stroke="#10b981" stroke-width="10" stroke-linecap="round"/>
        <circle cx="33" cy="28" r="8" fill="#cbd5e1"/>
        <polyline points="-35,32 -25,18 -15,32" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="15" y1="30" x2="15" y2="-6" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        <circle cx="15" cy="-6" r="14" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/>
        {db(15, -8, 0)}
    '''
}
create_sequence_svg('assets/diagrams/seq_floor_press.svg', 'Dambıl Zemin Presi', [fp1, fp2, fp3])

# 17. Dambıl Thruster (Squat + Pres)
th1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Dambıl Omuzda Squat İnişi', 'subcaption': 'Derin squata kontrollü çöküş',
    'drawing': f'''
        {ground(48)}
        <polyline points="-16,45 -28,30 -6,28" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="16,45 28,30 6,28" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="28" x2="0" y2="4" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-8" r="9" fill="#cbd5e1"/>
        {db(-12, 2, 0)}
        {db(12, 2, 0)}
    '''
}
th2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Bacak Momentum Aktarımı', 'subcaption': 'Tabandan fırlayan güç omuzlara akar',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <polyline points="-10,-20 -14,-36 -14,-42" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/>
        <polyline points="10,-20 14,-36 14,-42" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M-22,-20 L-22,-44" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrowGold)"/>
        {db(-14, -42, 0)}
        {db(14, -42, 0)}
    '''
}
th3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Baş Üstü Tam Kilit', 'subcaption': 'Bacak ve kollar aynı anda dimdik kilitlenir',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="4" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="#10b981" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <line x1="-8" y1="-20" x2="-10" y2="-55" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        <line x1="8" y1="-20" x2="10" y2="-55" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        <circle cx="0" cy="-55" r="16" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/>
        {db(-10, -56, 0)}
        {db(10, -56, 0)}
    '''
}
create_sequence_svg('assets/diagrams/seq_thruster.svg', 'Dambıl Thruster', [th1, th2, th3])

# 18. Dambıl Çiftçi Yürüyüşü (Farmer's Walk)
fw1 = {
    'badge_color': '#38bdf8', 'badge_text': '1. BAŞLANGIÇ',
    'caption': 'Ağır İki Dambılla Duruş', 'subcaption': 'Omuzlar geride ve aşağıda, dik omurga',
    'drawing': f'''
        {ground(48)}
        <line x1="-8" y1="45" x2="-5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="8" y1="45" x2="5" y2="10" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <line x1="-12" y1="-18" x2="-15" y2="5" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        <line x1="12" y1="-18" x2="15" y2="5" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
        {db(-15, 6, 0, 1.2)}
        {db(15, 6, 0, 1.2)}
    '''
}
fw2 = {
    'badge_color': '#f59e0b', 'badge_text': '2. ARA GEÇİŞ',
    'caption': 'Kısa ve Ritmik Adımlar', 'subcaption': 'Yalpalamadan, karın taş gibi sıkılı ilerleyiş',
    'drawing': f'''
        {ground(48)}
        <polyline points="-12,45 -8,25 -2,10" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="14,45 8,25 2,10" stroke="#64748b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="10" x2="0" y2="-22" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-35" r="9" fill="#cbd5e1"/>
        <line x1="-12" y1="-18" x2="-15" y2="5" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
        <line x1="12" y1="-18" x2="15" y2="5" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
        <path d="M-22,38 L-6,38" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowGold)"/>
        {db(-15, 6, 0, 1.2)}
        {db(15, 6, 0, 1.2)}
    '''
}
fw3 = {
    'badge_color': '#10b981', 'badge_text': '3. SON BİTİRİŞ',
    'caption': 'Squat Formuyla Bırakış', 'subcaption': 'Beli bükmeden, dizleri kırarak yere koyuş',
    'drawing': f'''
        {ground(48)}
        <polyline points="-14,45 -22,25 -6,20" stroke="#10b981" stroke-width="6" stroke-linecap="round" fill="none"/>
        <polyline points="14,45 22,25 6,20" stroke="#10b981" stroke-width="6" stroke-linecap="round" fill="none"/>
        <line x1="0" y1="20" x2="0" y2="-4" stroke="url(#bodyGrad)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="0" cy="-16" r="9" fill="#cbd5e1"/>
        <line x1="-12" y1="-4" x2="-16" y2="28" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        <line x1="12" y1="-4" x2="16" y2="28" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
        {db(-16, 32, 0, 1.2)}
        {db(16, 32, 0, 1.2)}
    '''
}
create_sequence_svg('assets/diagrams/seq_farmers_walk.svg', 'Dambıl Çiftçi Yürüyüşü', [fw1, fw2, fw3])

print("All 18 exercise sequence diagrams created successfully!")
