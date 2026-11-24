# Koshin: Silk Road Puzzle — ishlash qoidalari

To'liq texnik topshiriq: `PROMPT.md`. Joriy holat: `PROGRESS.md`.

## Har kungi avtomatik ish (kunlik sessiya)
1. `PROGRESS.md` ni o'qi: qaysi bosqich tugagan, keyingisi qaysi, ochiq xatolar.
2. Avval `npm test` ni ishga tushir. Agar avvalgi bosqichlardan biror test yiqilsa — AVVAL shuni tuzat.
3. Keyingi BITTA bosqichni `PROMPT.md` dagi tartib bo'yicha bajar:
   kod → mantiq uchun testlar (`tests/*.test.js`, `node --test`) → ishga tushir → xatolarni tuzat → testlar 100% o'tmaguncha davom et.
4. Bosqich tugamasa ham, qilingan ishni saqla va `PROGRESS.md` ga "qisman" deb yoz — ertaga davom ettiriladi.
5. `PROGRESS.md` ni yangila (o'zbekcha, qisqa hisobot: nima qilindi, qaysi xato tuzatildi, keyingi qadam).
6. `main` ga commit qil va push qil.
7. Foydalanuvchiga o'zbekcha qisqa hisobot yubor.

## Texnik qoidalar
- Tashqi kutubxona yo'q (npm install ishlamaydi). Faqat vanilla JS, ES modullar, Canvas.
- O'yin mantig'i `src/logic/` da — DOM/Canvas'ga bog'liq emas, Node'da test qilinadi.
- Grafika, ovoz — faqat original (kod orqali chizilgan/generatsiya qilingan).
- Testlar: `npm test` (`node --test tests/*.test.js`).
- Eski ishlab turgan narsani buzma: har o'zgarishdan keyin hamma testlar o'tishi shart.
