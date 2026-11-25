# Koshin — rivojlanish jurnali

Ishlayapti: yo'q

Keyingi bosqich: **2** (qator/ustun tozalash, ochko, combo, streak, o'yin tugashi)

## Bosqichlar holati
- [x] 1. Loyiha tuzilmasi, 8x8 maydon, sudrab qo'yish — 2026-11-24
- [ ] 2. Qator/ustun tozalash, ochko, combo, streak, o'yin tugashi
- [ ] 3. Shakl generatori va adolatlilik qoidasi
- [ ] 4. Koshin dizayni: plitkalar, fon, ranglar, animatsiyalar
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
