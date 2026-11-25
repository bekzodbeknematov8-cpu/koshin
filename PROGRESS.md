# Koshin — rivojlanish jurnali

Ishlayapti: 2026-11-25 05:28 UTC

Keyingi bosqich: **5** (sarguzasht: bosqich generatori, maqsadlar, yulduzlar, Ipak Yo'li xaritasi)

## Bosqichlar holati
- [x] 1. Loyiha tuzilmasi, 8x8 maydon, sudrab qo'yish — 2026-11-24
- [x] 2. Qator/ustun tozalash, ochko, combo, streak, o'yin tugashi — 2026-11-25
- [x] 3. Shakl generatori va adolatlilik qoidasi — 2026-11-25
- [x] 4. Koshin dizayni: plitkalar, fon, ranglar, animatsiyalar — 2026-11-25
- [ ] 5. Sarguzasht: bosqich generatori, maqsadlar, yulduzlar, Ipak Yo'li xaritasi
- [ ] 6. To'siqlar, boss bosqichlar, binoni qayta qurish, "Abadiy yo'l"
- [ ] 7. Kuchaytirgichlar va tanga tizimi
- [ ] 8. Kunlik Naqsh va ulashish; Cheksiz rejim
- [ ] 9. Topshiriqlar, yutuqlar, ovoz/musiqa, tebranish, menyu, sozlamalar, 4 til
- [ ] 10. Saqlash, PWA, internetsiz ishlash, tezlikni optimallashtirish
- [ ] 11. Yakuniy umumiy test, GitHub Pages'ga joylash yo'riqnomasi

## Ochiq xatolar / foydalanuvchi takliflari
(hozircha yo'q)

## Hisobotlar

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
