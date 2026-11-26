# Reklama orqali daromad — yo'riqnoma

O'yinda reklama tizimi tayyor. Pul tushishi uchun faqat reklama tarmog'ida ro'yxatdan o'tib, ID'ni `src/ads/config.js` ga yozish kerak.

## Reklama qayerda chiqadi

**Mukofotli (rewarded)** — o'yinchi o'zi bosadi, eng ko'p daromad shundan keladi:

| Joy | Mukofot | Kunlik chegara |
|---|---|---|
| Bosqichda yutqazganda | +5 yurish | 20 |
| G'alaba oynasida | tangalar x2 | 15 |
| Cheksiz rejim tugaganda | "Ikkinchi imkoniyat" (2–4 qator tozalanadi) | 10 |
| Kunlik Naqsh | +1 urinish | 1 |
| Menyuda "Bepul tanga" | +25 tanga | 5 |
| Omad charxi | yana 1 aylantirish | 2 |

**Oraliq (interstitial)** — faqat bosqichlar orasida, juda ehtiyotkor:
- birinchi 6 ta bosqichda umuman chiqmaydi (yangi o'yinchi qochib ketmasin);
- keyin eng ko'pi bilan har 3 bosqichda bitta, kamida 3 daqiqa oraliq bilan, kuniga 10 tadan oshmaydi;
- o'yinchi mukofotli reklama ko'rgan bo'lsa, keyingi 2 daqiqa oraliq reklama chiqmaydi.

Bu qoidalarni `src/logic/ads.js` dagi `AD_RULES` ichida o'zgartirish mumkin (testlar: `tests/ads.test.js`).

## 1-yo'l: sayt / GitHub Pages — Google AdSense (H5 Games Ads)
1. https://adsense.google.com da ro'yxatdan o'ting, saytingizni (masalan `https://<login>.github.io/koshin/`) qo'shing va tasdiqlating.
2. AdSense'da **H5 Games Ads** (o'yinlar uchun reklama) beta'siga ariza bering — u alohida tasdiqlanadi.
3. `src/ads/config.js`:
   ```js
   provider: 'auto',
   h5: { clientId: 'ca-pub-XXXXXXXXXXXXXXXX', testMode: true },
   ```
   Avval `testMode: true` bilan sinang, ishlasa `false` qiling.
4. Repo ildiziga `ads.txt` fayl qo'ying (AdSense ko'rsatgan bitta qator), so'ng push qiling.

## 2-yo'l: Google Play ilova — AdMob (eng ko'p daromad)
TWA (Bubblewrap) ichida AdMob ishlamaydi, shuning uchun ilovani **Capacitor** bilan o'rash kerak:
1. Kompyuterda: `npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor-community/admob`
2. `npx cap init Koshin uz.koshin.game --web-dir .` → `npx cap add android`
3. https://admob.google.com da ilova qo'shing, **Rewarded** va **Interstitial** reklama bloklarini yarating.
4. `android/app/src/main/AndroidManifest.xml` ga AdMob App ID ni yozing (`com.google.android.gms.ads.APPLICATION_ID`).
5. `src/ads/config.js`:
   ```js
   provider: 'auto',
   admob: { rewardedId: 'ca-app-pub-.../...', interstitialId: 'ca-app-pub-.../...', testing: true },
   ```
6. `npx cap sync android` → Android Studio'da build. Sinovdan keyin `testing: false`.

O'yin kodi o'zi aniqlaydi: Capacitor ichida bo'lsa — AdMob, brauzerda — AdSense.

## Sinash (pulsiz)
`provider: 'demo'` qilsangiz, har reklama o'rnida 3 soniyalik soxta oyna chiqadi — joylashuvni ko'rish uchun.
`provider: 'none'` (yoki ID yozilmagan bo'lsa) — reklama chiqmaydi, mukofot darhol beriladi.

## Muhim
- Hech qachon o'zingiz reklamaga bosmang — hisob bloklanadi.
- Google Play'da "Contains ads" belgisini qo'ying, maxfiylik siyosati (privacy policy) sahifasi kerak.
- Yevropa foydalanuvchilari uchun AdMob/AdSense'ning rozilik (consent) oynasini yoqing.
- "Reklamasiz" xaridi uchun joy tayyor: `app.ads.setNoAds(true)` (oraliq reklamani o'chiradi).
