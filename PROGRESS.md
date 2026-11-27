# Koshin — rivojlanish jurnali

Ishlayapti: yo'q

Keyingi bosqich: **hammasi tugadi** — endi foydalanuvchi sinovi va takliflar (pastdagi "Ochiq xatolar" ro'yxati)

## Bosqichlar holati
- [x] 1. Loyiha tuzilmasi, 8x8 maydon, sudrab qo'yish — 2026-11-24
- [x] 2. Qator/ustun tozalash, ochko, combo, streak, o'yin tugashi — 2026-11-25
- [x] 3. Shakl generatori va adolatlilik qoidasi — 2026-11-25
- [x] 4. Koshin dizayni: plitkalar, fon, ranglar, animatsiyalar — 2026-11-25
- [x] 5. Sarguzasht: bosqich generatori, maqsadlar, yulduzlar, Ipak Yo'li xaritasi — 2026-11-25
- [x] 6. To'siqlar, boss bosqichlar, binoni qayta qurish, "Abadiy yo'l" — 2026-11-25
- [x] 7. Kuchaytirgichlar va tanga tizimi — 2026-11-25
- [x] 8. Kunlik Naqsh va ulashish; Cheksiz rejim — 2026-11-25
- [x] 9. Topshiriqlar, yutuqlar, ovoz/musiqa, tebranish, menyu, sozlamalar, 4 til — 2026-11-25
- [x] 10. Saqlash, PWA, internetsiz ishlash, tezlikni optimallashtirish — 2026-11-25
- [x] 11. Yakuniy umumiy test, GitHub Pages'ga joylash yo'riqnomasi — 2026-11-25

## Ochiq xatolar / foydalanuvchi takliflari
Foydalanuvchi so'rovi (2026-11-26): "yanada yaxshila" — grafika, balans, yangi imkoniyatlar, ovoz, reklama orqali daromad. Muhimlik bo'yicha:
- [x] 1. Reklama tizimi: rewarded (yurish, x2 tanga, bepul kuchaytirgich, Cheksizda "ikkinchi imkoniyat", bepul tanga) + cheklangan interstitial; AdSense H5 / AdMob ulash joyi; `ADS.md` yo'riqnoma
- [x] 2. Omad charxpalagi: kuniga 1 bepul aylantirish, reklama bilan yana
- [x] 3. Grafika: tozalash nuri, to'lqin halqasi, ochko uchishi, "perfect" chaqnashi
- [x] 4. Ovoz: har shaharga o'z kuyi, yangi effektlar
- [x] 5. Balans: bosqich qiyinligi va mukofotlarni ko'rib chiqish
- [x] 6. (2026-11-27) Telefonda musiqa eshitilmadi, shakl qo'yishda g'alati ovoz — tuzatildi
- [x] 7. (2026-11-27) "Musiqa asabni buzadi, o'zgartir" — musiqa butunlay qayta yozildi (sokin, tuzilgan kuylar)

## Hisobotlar

### 2026-11-27 — Musiqa qayta yozildi
- Sabab: eski kuy tasodifiy (random walk) generatsiya qilinardi, tez va notalar ko'p edi — asabga tegardi.
- Yangi: `composeMelody` — 2 taktli motiv, A A' B A shakli, kuchli hissada akkord tovushi, faqat silliq harakat, oxiri tonikada. Taktda 1–3 ta uzun nota.
- Akkordlar ketma-ketligi (4 xil), iliq akkord foni (`pad`), past bas, juda past dutor arpejiosi.
- Bosh cholg'u: nay (`flute`, yumshoq vibrato) yoki qo'ng'iroqcha — shaharga qarab.
- Temp sekinlashtirildi (0.27–0.35 → 0.38–0.45 s), doira ko'p shaharda o'chirildi, qolganida juda past.
- Testlar: 105/105 (yangi: kuy tuzilishi, nay/pad tembrlari), smoke va E2E o'tdi.

### 2026-11-27 10:30 UTC — Tekshiruv
- Ochiq xatolar ro'yxati bo'sh, yangi ish yo'q.
- `npm test`: 103/103 o'tdi; smoke (kadr ~0.5 ms, internetsiz OK) va E2E o'tdi.

### 2026-11-27 — Ovoz tuzatildi
- Musiqa yo'q edi: sensor ekranda brauzer ovozga faqat barmoq ko'tarilganda ruxsat beradi, `unlock` esa bir marta pointerdown'da chaqirilardi. Endi har teginishda (pointerup/touchend/click) qayta uriniladi; fondan qaytganda to'plangan notalar birdan chalinmaydi.
- Musiqa ovozi kuchaytirildi (0.18 → 0.42), kuy yumshoq `softTone` (kalimba uslubi) bilan chalinadi.
- Shakl qo'yish ovozi: past, shovqinli tor o'rniga ikki notali yumshoq qo'ng'iroqcha. Master zanjiriga lowpass filtr va kompressor qo'shildi.
- Testlar: 103/103, smoke va E2E o'tdi.

### 2026-11-24 — 1-bosqich
- Qilindi: `src/logic/` (board, shapes, game — DOM'siz mantiq), `src/main.js` (Canvas chizish, Pointer Events orqali sudrab qo'yish: sensor ekran + sichqoncha, shakl barmoqdan yuqorida ko'rinadi, joylashadigan joy shaffof ko'rsatiladi), `index.html`.
- 21 xil shakl, deterministik RNG (kunlik seed uchun tayyor).
- Testlar: 9/9 o'tdi.
- Tuzatilgan xato: `node --test tests/` papka yo'lini qabul qilmadi → `tests/*.test.js` ga o'zgartirildi.
- Eslatma: ranglar vaqtinchalik, koshin dizayni 4-bosqichda.

### 2026-11-25 — 2-bosqich
- Qilindi: `src/logic/score.js` — to'lgan qator/ustunlarni topish va tozalash (kesishma bir marta), ochko: qo'yilgan kataklar + COMBO (n qator → n²×80) × STREAK (×1, ×1.5, ×2 … ×5 gacha), 3 yurish tozalashsiz o'tsa streak uziladi, maydon to'liq bo'shasa +300 "PERFECT". `game.js`: `tryPlace` endi natija obyekti qaytaradi (ochko, tozalangan kataklar, over), o'yin tugashi (`over`).
- UI: ochko, rekord (localStorage), streak belgisi, tozalash animatsiyasi, COMBO yozuvi, tebranish, o'yin tugash ekrani.
- `tools/smoke.mjs` — Playwright bilan brauzer tutun testi (sahifa xatosiz yuklanadi, sudrab qo'yish ishlaydi).
- Testlar: 20/20 o'tdi.
- Tuzatilgan xato: Playwright ES modulda topilmadi → `createRequire` orqali yuklandi; `localStorage` ba'zi muhitlarda xato berishi mumkin → try/catch.

### 2026-11-25 — 3-bosqich
- Qilindi: `src/logic/generator.js` — qiyinlikka qarab og'irlikli tanlov (oson: kichik shakllar, qiyin: katta), 3 xil adolat rejimi: `strict` (uchala shaklni qaysidir tartibda joylash mumkinligi DFS bilan tekshiriladi), `normal` (maydon ≥55% to'lsa qator yopuvchi "rahm" shakli), `none`; har doim kamida 1 ta shakl joylashishi kafolatlanadi; 3 ta bir xil shakl chiqmaydi. Shakllar 39 taga yetdi (burilgan variantlar), `rotateCells`/`shapeIdOf` (7-bosqichdagi Aylantirish uchun tayyor).
- `game.js`: dastlabki 30 yurish `strict`, keyin `normal`; qiyinlik ochko bilan sekin o'sadi. `opts.difficulty/fairness/pool/generator` orqali bosqichlar sozlanadi.
- Testlar: 30/30 o'tdi (300 tasodifiy maydonda kafolat, 15 ta to'liq avtomatik o'yin simulyatsiyasi). Eng og'ir holatda generator ~5 ms.

### 2026-11-25 — 4-bosqich
- Qilindi: `src/render/` — sirlangan koshin plitkalari (gradient sir, yaltirash, hoshiya; har rangning o'z naqshi: 8 qirrali girih yulduz, islimiy gul, romb to'r, 4 bargli gul, xoch-yulduz — rangni ajratolmaydiganlar uchun ham), spraytlar keshlanadi; kechki Samarqand osmoni (yulduzlar, o'roq oy, gumbaz/minora/peshtoq siluetlari, ikki qatlam), oltin hoshiyali maydon.
- `src/fx/` — oltin chang zarrachalari (gravitatsiya, soni cheklangan), easing, ochko sanog'i animatsiyasi.
- `src/ui/gameScreen.js` — o'yin ekrani alohida modul (keyingi rejimlar `hooks` orqali ulanadi); `main.js` — sahna/kadr sikli (faqat animatsiya bo'lganda chiziladi — batareya tejaladi), bitta barmoq qoidasi.
- Animatsiyalar: qo'yilganda "pop", tozalanishda kichrayib oltin changga aylanish, qaysi qatorlar tozalanishini oldindan oltin bilan ko'rsatish, COMBO ×N, streak alangasi, PERFECT, ekran silkinishi, noto'g'ri tashlangan shakl joyiga qaytadi, matnsiz o'yin tugash ekrani (toj + ↻ tugmasi).
- Testlar: 35/35. Brauzer tutun testi (Playwright) — xatosiz, skrinshotlar tekshirildi.

### 2026-11-25 — 5-bosqich
- Qilindi: `levels.js` — 7 shahar × 20 bosqich (Xiva → Buxoro → Samarqand → Shahrisabz → Toshkent → Qo'qon → Termiz), bosqichlar qoida asosida deterministik generatsiya qilinadi: maqsad (ochko / qatorlar / ikkalasi), yurishlar soni, qiyinlik egri chizig'i (har 5-bosqich yengilroq, boss biroz qiyin), dastlabki 3 bosqich — o'rgatish (oddiy shakllar). 140-dan keyin "Abadiy yo'l" indekslari (6-bosqichda to'liq).
- `levelGame.js` — cheklangan yurishlar, maqsad, g'alaba/mag'lubiyat (yurish tugadi / joy qolmadi), 1–3 yulduz, "reklama ko'r — +5 yurish" (bir marta; reklama joyi `app.ads.showRewarded`).
- `progress.js` — yulduzlar, ochilgan bosqichlar, buzilgan saqlangan ma'lumotni tozalash. `buildings.js` — har shahar binosi 8x8 koshin loyihasi, xaritada o'tilgan bosqichlarga qarab bezaladi.
- UI: Ipak Yo'li xaritasi (aylantirish inersiya bilan, shahar lentasi, bino, qiziqarli fakt, yulduzlar, qulf, boss tuguni), bosqich ekrani (yurishlar medalyoni, maqsadlar va progress, g'alaba oynasida yulduzlar animatsiyasi, mag'lubiyatda xarita/qayta/+5). `i18n.js` — 4 til (avtomatik tanlash), shahar nomlari va faktlar.
- `bot.js` — avtomatik o'yinchi (balansni tekshirish uchun). Bot sarguzasht bosqichlarining ~85% ini yutadi.
- Testlar: 48/48.
- Tuzatilgan xatolar: bot juda kuchsiz edi (~20 yurishda tiqilib qolardi) → evristika yaxshilandi (bo'shliqlar, notekislik, katta shakllarga joy); ochko maqsadlari juda oson, qator maqsadlari juda qattiq edi → yurishlar formulasi kalibrlandi; cheklangan yurishli bosqichlarda tiqilib qolish ko'p edi → qiyinlik < 0.6 bo'lsa qat'iy adolat.

### 2026-11-25 — 6-bosqich
- Qilindi: `obstacles.js` — muz (2 marta tozalash; muzlar qatorlarda guruhlanadi), tosh (joy band, qatorni to'ldirmaydi, faqat yonidagi katak tozalansa sinadi), zanjir (tozalashda uziladi, koshin qoladi), olmos (maydonda va ba'zi shakllarda; qatori tozalansa yig'iladi), qurilish nishoni.
- Mexanikalar shaharlar bo'ylab ochiladi: Buxoro — muz, Samarqand — tosh, Shahrisabz — zanjir, Toshkent — olmos, Qo'qon — aralash, Termiz — hammasi. Har shaharning 20-bosqichi BOSS: shahar binosini (Kalta minor, Kalon, Registon, Oqsaroy, Ko'kaldosh, Xudoyorxon saroyi, Sulton Saodat — erkin 8x8 talqin) koshinlar bilan qayta qurish; xaritada bino o'tilgan bosqichlarga qarab bezaladi.
- "Abadiy yo'l" (141+): generator cheksiz bosqich yaratadi, barcha to'siqlar aralash, har 20-sida boss, qiyinlik sekin va chegaralangan o'sadi.
- Chizish: tosh, muz (yoriq holati bilan), zanjir+qulf, olmos, oltin nishon kataklari; zarrachalar (muz/tosh/zanjir sinishi), maqsad belgilari.
- Testlar: 59/59.
- Tuzatilgan xatolar: (1) toshning qo'shnisini tekshirishda qator chetidan "indeks to'qnashuvi" (r*8+c, c=-1) bo'lardi → chegara avval tekshiriladi, test qo'shildi; (2) bosqich boshidagi shakllar to'siqlar qo'yilishidan OLDIN tanlanardi → bot 2 yurishda tiqilib qolardi → to'siqlardan keyin qayta tanlanadi; (3) to'siqlar juda ko'p edi (20 katak) → chegaralandi; (4) to'siqli bosqichlarda katta shakllar ko'p edi → shakl qiyinligi ×0.75 va barcha sarguzasht bosqichlarida qat'iy adolat; muz/zanjir/tosh uchun yurishlar bot yordamida kalibrlandi (~75% bosqichni bot yutadi).

### 2026-11-25 — 7-bosqich
- Qilindi: `powerups.js` — Bomba (3x3), Bolg'a (1 katak, toshni ham sindiradi), Aylantirish (90°, olmos o'z katagida qoladi), Almashtirish (boshqa, joylashadigan shakl). Hamyon: tangalar + zaxira, narxlar (40–120), zaxira tugasa tanga bilan avtomatik sotib olinadi, buzilgan saqlangan ma'lumot tozalanadi.
- Tanga topish: bosqich g'alabasi 10 + 5×yulduz (+50 boss), qayta o'tishda yarmi; Cheksiz rejimda ochko/100.
- Bosqichda kuchaytirgich yurish sarflamaydi, to'siq maqsadlarini hisoblaydi va g'alabani tekshiradi; tiqilib qolgan o'yinni qutqarishi mumkin.
- UI: pastda 4 tugma (belgi + soni yoki narxi), nishonga olish rejimi (bomba uchun 3x3 ko'rsatma), tanga yetmasa tugma silkinadi; tangalar o'yin va xarita ekranida; g'alaba oynasida "+N tanga". Ipak Yo'li tangasi belgisi (to'rtburchak teshikli).
- Joylashuv: maydon + shakllar + tugmalar paneli kichik ekranlarga (iPhone SE) ham sig'adi.
- Testlar: 68/68; tutun testi bolg'ani brauzerda bosib tekshiradi.

### 2026-11-25 — 8-bosqich
- Qilindi: `daily.js` — kun raqami (2026-01-01 = #1, telefonning mahalliy sanasi bo'yicha), sana seed'i; hamma uchun bir xil boshlang'ich simmetrik naqsh + 30 ta shaklning bir xil ketma-ketligi (maydondan mustaqil → natijalarni solishtirish adolatli). Kuniga 1 urinish + reklama bilan yana 1, ketma-ket kunlar seriyasi, har 7-kun mukofoti (200 tanga + bomba), kun o'tkazib yuborilsa seriya uziladi.
- Ulashish: `Koshin #128 🟦🟨🟦⬜🟨 2450` (har bir uchlik uchun: ⬜ — qator yo'q, 🟦 — 1 qator, 🟨 — combo), `navigator.share` yoki nusxa olish.
- Cheksiz rejim: shaxsiy rekord saqlanadi, o'yin oxirida tanga; `src/net/leaderboard.js` — global reyting uchun tayyor API joyi (server manzili berilmaguncha jim ishlaydi).
- UI: xaritada kalendar tugmasi ("!" — bugun o'ynalmagan), Kunlik markaz (kun raqami, seriya alangasi, 7 kunlik nuqtalar, urinishlar, o'ynash/reklama/ulashish), Kunlik o'yin ekrani (qolgan uchliklar chizig'i, natija oynasida rangli kvadratlar va ulashish).
- Testlar: 77/77; tutun testi kunlik markaz va o'yinni ochadi.
- Tuzatilgan xato: 7-kun mukofoti ikkinchi marta (14-kun) berilmasdi — `claimed` mantiqi noto'g'ri edi → seriya kuniga bir marta oshgani uchun mukofot shu paytda beriladi.

### 2026-11-25 — 9-bosqich
- Qilindi: `meta.js` — statistika (qatorlar, combo, bosqichlar, yulduzlar, boss, olmos, muz, tosh, kuchaytirgichlar…), 18 ta yutuq (tanga mukofoti bilan, ochilganda yuqorida lenta chiqadi), kundalik 3 ta topshiriq (sana bo'yicha, har xil turdagi, mukofotni olish tugmasi), ketma-ket kirish sovg'asi (7 kunlik: 20…150 tanga + 7-kunda bomba).
- Ovoz: `audio/synth.js` — dutor/rubob uslubidagi chertma tor (Karplus–Strong sintezi), doira (dum/tak), D ladida (ortirilgan sekunda bilan) qisqa effektlar va 6/8 o'lchovdagi generativ fon kuyi; `audio/sound.js` — WebAudio, ovoz/musiqa alohida o'chiriladi, ilova fonga o'tsa musiqa to'xtaydi, ovoz birinchi teginishdan keyin yoqiladi (brauzer talabi). Hech qanday tayyor audio fayl yo'q.
- Tebranish sozlamaga bog'landi. Bosh menyu (Sarguzasht, Kunlik Naqsh, Cheksiz, Topshiriqlar, Yutuqlar, Sozlamalar), sozlamalar (ovoz, musiqa, tebranish, til: English/O'zbekcha/Русский/Türkçe), xaritada uyga qaytish tugmasi.
- 4 til: menyu, topshiriqlar, yutuqlar, sovg'a matnlari; til avtomatik, sozlamadan o'zgartiriladi.
- Testlar: 84/84 (ovoz sintezi ham Node'da tekshiriladi: so'nish, klik yo'qligi, lad, kuy deterministikligi). Tutun testi: menyu, sozlamalar, topshiriqlar, yutuqlar, xarita ekranlari xatosiz ochiladi.

### 2026-11-25 — 10-bosqich
- Saqlash: `storage.js` — versiyali saqlash (eski ma'lumotni ko'chirish), buzilgan JSON va to'lib qolgan xotiraga chidamli (o'yin xotirada davom etadi), zaxira kodi (eksport/import, sozlamalarda — boshqa telefonga ko'chirish uchun). Cheksiz o'yin har yurishdan keyin va ilova fonga o'tganda saqlanadi; qaytib kirganda aynan shu joydan davom etadi (RNG holati ham tiklanadi).
- PWA: `manifest.webmanifest`, belgilar (`icons/` — koshin plitkalaridan `tools/make-icons.mjs` bilan yaratilgan, maskable ham), `sw.js` (barcha fayllar oldindan keshlanadi, eski kesh tozalanadi); `npm run build` (`tools/build-sw.mjs`) fayllar ro'yxati va kesh versiyasini avtomatik yangilaydi; test sw.js eskirib qolmaganini tekshiradi.
- Internetsiz ishlash: tutun testida tarmoq o'chirilib qayta yuklanadi — o'yin ochiladi.
- Tezlik: fon alohida canvas qatlamida (bir marta chiziladi), maydon hoshiyasi + 64 bo'sh katak bitta keshlangan rasm, sudralayotgan shakl soyasi `shadowBlur` siz, zarrachalar save/restore'siz. Og'ir kadr: 4.0 ms → 0.8 ms (6 barobar tez).
- Testlar: 91/91.

### 2026-11-25 — 11-bosqich
- Yakuniy umumiy test: `tools/e2e.mjs` — brauzerda HAQIQIY sudrash bilan to'liq oqim: menyu → xarita → 1-bosqich tugunini bosish → bot sudrab o'ynab yutadi (shakl aniq joyga tushishi tekshiriladi) → yulduz va tanga saqlanadi → "keyingi" → mag'lubiyat → "+5 yurish" → Cheksiz o'yin qayta yuklashdan keyin davom etadi → til O'zbekchaga o'zgaradi va saqlanadi → iPhone SE (320×568) ekraniga sig'adi. Hammasi ✓.
- Tutun testi: 390×844, 320×568, 1280×720 o'lchamlarda barcha ekranlar xatosiz; internetsiz qayta yuklash ✓; og'ir kadr 0.8 ms.
- Tuzatilgan xatolar: (1) Cheksiz rejimda o'yin tugagach "ortga" tugmasi ishlamasdi (faqat ↻ bor edi) → endi ishlaydi; (2) kichik ekranda menyudagi "Sarguzasht" yozuvi pastki tugmalarga tegib qolardi → tugmalar ekran balandligiga qarab kichrayadi; (3) tutun testi ekran o'lchamiga bog'liq koordinata ishlatardi → tuzatildi.
- `DEPLOY.md` — GitHub Pages'ni yoqish (Settings → Pages → main / root), telefonda ochish va o'rnatish, yangilash, Google Play (TWA/Bubblewrap) yo'li. `README.md` — o'zingiz sinab ko'rish uchun 13 bandlik ro'yxat. `.nojekyll` qo'shildi.
- Testlar: 91/91 (mantiq) + tutun + E2E.

### 2026-11-26 — avtomatik tekshiruv
- Hamma 11 bosqich tugagan, ochiq xatolar ro'yxati bo'sh — yangi ish boshlanmadi.
- Umumiy test: `npm test` 91/91, `tools/smoke.mjs` OK, `tools/e2e.mjs` OK. (oxirgi: 15:30 UTC)

### 2026-11-26 — Yaxshilash 1–2: reklama tizimi va Omad charxi
- `src/logic/ads.js` — reklama siyosati (kunlik chegaralar, oraliq reklama: 6-bosqichdan keyin, har 3 bosqichda, 3 daqiqa oraliq, mukofotlidan keyin 2 daqiqa tinch, `noAds`).
- `src/ads/adManager.js` + `src/ads/config.js` — provayderlar: AdMob (Capacitor), AdSense H5 Games Ads, demo, yo'q. Yo'riqnoma: `ADS.md`.
- Yangi mukofotli joylar: g'alabada x2 tanga, Cheksizda "Ikkinchi imkoniyat" (`src/logic/revive.js`), menyuda "Bepul tanga" (+25), charxda qo'shimcha aylantirish. Bosqichlar orasida oraliq reklama.
- `src/logic/wheel.js` + `src/ui/wheelScreen.js` — Omad charxi (8 bo'lak, kuniga 1 bepul).
- Tuzatildi: ikkinchi imkoniyatdan keyin Cheksizda tanga ikki marta berilmaydi (faqat yangi ochko uchun).
- Testlar: 99/99 (+8 yangi), smoke OK, E2E OK (+8 yangi tekshiruv: charx, bepul tanga, ikkinchi imkoniyat, demo reklama).

### 2026-11-26 — Yaxshilash 3–4: grafika va ovoz
- Grafika: tozalangan qator/ustun bo'ylab oltin nur, joylashgan shakldan to'lqin halqasi (combo'da ikkinchi firuza halqa), "perfect"da ekran chaqnashi, yangi 3 shakl pastdan sakrab kiradi.
- Ovoz: 10 ta kuy mavzusi (`MUSIC_THEMES`) — har shahar, menyu, Kunlik Naqsh va Abadiy yo'l uchun o'z ladi (hijoz, dorian, frigiy, major, minor), tonikasi, tempi va doira usuli; kuy takt boshidan uzilishsiz almashadi. Ikkinchi tor ovozi. Yangi effektlar: yulduz, charx chiqillashi, sovg'a, ikkinchi imkoniyat.
- Testlar: 100/100, smoke OK, E2E OK.

### 2026-11-26 — Yaxshilash 5: balans
- Bot sinovi (140 bosqich): Qo'qon keskin qiyin edi (bot 9/20 yutgan). Shaharlar bo'yicha qiyinlik o'sishi 0.1 → 0.085; ikki xil to'siqli bosqichlarda shakllar yengilroq (×0.6), to'siqlar uchun yurishlar ko'paydi; o'rgatish bosqichlarida kamida 14 yurish.
- Natija (bot): har shaharda 75–100% (avval 45–100%). Yangi test: har shaharda kamida 60%.
- Yordam yurishlari: bir bosqichda 2 marta yutqazsa +3, 4 marta +6 yurish (yulduzga ta'sir qilmaydi, g'alabadan keyin nolga tushadi).
- Testlar: 102/102, smoke OK, E2E OK.

Keyingi qadam: reklamadan pul tushishi uchun `ADS.md` bo'yicha AdSense (sayt) yoki AdMob (Google Play) ID'larini `src/ads/config.js` ga yozish.

### 2026-11-26 20:30 UTC — avtomatik tekshiruv
Barcha 11 bosqich va takliflar ro'yxati bajarilgan, ochiq band yo'q. Umumiy test: 102/102 o'tdi, barcha JS fayllar sintaksis tekshiruvidan o'tdi. Yangi ish qilinmadi — yangi takliflar kutilmoqda.
