# ÇELİK KODU - LOCAL-FIRST & KATI CANLIYA ALMA YASAĞI

1. **Her Şey Lokalde:** Tüm kod düzenlemeleri, stil güncellemeleri ve testler YALNIZCA yerel diskte yapılır ve lokalde bırakılır.
2. **Kullanıcı İzni Olmadan Push Yasaktır:** Kullanıcı açıkça "canlıya al", "push et", "deploy et" veya "yayınla" talimatı vermediği sürece ASLA `git push` ÇALIŞTIRILMAZ.
3. **Yerel Doğrulama:** Değişiklikler lokalde (`node -e` vb.) test edilir ve görevin tamamlandığı kullanıcıya yerel olarak bildirilir.
4. **Yalnızca Açık Talimatla Canlıya Dağıtım:** Kullanıcı canlıya çıkış emri verdiğinde 4 noktada sürüm artırılır ve `git push origin main` yapılır.
