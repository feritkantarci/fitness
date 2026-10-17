#!/usr/bin/env python3
import asyncio
import sys
import os
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

async def run_pipeline(exercise_name: str):
    print(f"\n==================================================================")
    print(f"🤖 AUTOGEN BİYOMEKANİK & GÖRSEL DOĞRULAMA HATTI: {exercise_name}")
    print(f"==================================================================\n")

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

    # 1. Ajan: Biyomekanik Durak Tanımlayıcı
    author = AssistantAgent(
        name="Biomechanics_Author",
        model_client=model_client,
        system_message="""Sen Çelik Kodu (El Código del Acero) egzersiz biyomekaniği ve durak noktaları (waypoints) uzmanısın.
Sana verilen egzersizi şu 5 zorunlu durakta formüle et:
1. Durak 1 (Kurulum / Setup): Ayak tabanı, diz açısı, omurga nötr kilit, ekipman tutuşu.
2. Manevra 1->2: Hareketi başlatan eklem, sabit kalacak pivot eklem, kinetik itiş.
3. Durak 2 (Zirve / İstasyon): Tepe kasılma veya ara geçiş koordinatı.
4. Manevra 2->3: İkinci faz akışı ve sarkaç hareketi.
5. Durak 3 (Bitiş): Eksantrik iniş ve sıfırlanma.
Her durakta eklem açılarını (örn: 90° diz) ve yasakları (valgus, kifoz) açıkça yaz."""
    )

    # 2. Ajan: Spor Eğitmeni & Biyomekanik Denetçisi
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

    # 3. Ajan: Görsel Kalite & Açı Denetçisi
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

    termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(max_messages=10)

    team = RoundRobinGroupChat(
        participants=[author, trainer, auditor],
        termination_condition=termination
    )

    prompt = f"Lütfen '{exercise_name}' egzersizi için biyomekanik durak tanımlarını yapın, eğitmen denetiminden geçirin ve görsel üretim şartnamesini mühürleyin."

    await Console(team.run_stream(task=prompt))
    print(f"\n✅ İş akışı AutoGen tarafından başarıyla tamamlandı.\n")

if __name__ == "__main__":
    ex_name = sys.argv[1] if len(sys.argv) > 1 else "Dambıl Pullover to Halo"
    asyncio.run(run_pipeline(ex_name))
