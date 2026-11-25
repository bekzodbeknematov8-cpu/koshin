# Koshin: Silk Road Puzzle — ishlash qoidalari

To'liq texnik topshiriq: `PROMPT.md`. Joriy holat: `PROGRESS.md`.

## Avtomatik ish (har 5 soatda ishga tushadi, limit tugaguncha ishlaydi)
0. QULF: `PROGRESS.md` boshidagi `Ishlayapti:` qatorini tekshir. Unda 4 soatdan yangi vaqt bo'lsa — boshqa sessiya ishlayapti, hech narsa qilma va to'xta. Aks holda unga hozirgi vaqtni (UTC) yoz, commit + push qil.
1. `PROGRESS.md` ni o'qi: qaysi bosqich tugagan, keyingisi qaysi, ochiq xatolar.
2. Avval `npm test` ni ishga tushir. Agar avvalgi bosqichlardan biror test yiqilsa — AVVAL shuni tuzat.
3. Navbatdagi bosqichni `PROMPT.md` dagi tartib bo'yicha bajar:
   kod → mantiq uchun testlar (`tests/*.test.js`, `node --test`) → ishga tushir → xatolarni tuzat → testlar 100% o'tmaguncha davom et.
4. Bosqich tugashi bilan `PROGRESS.md` ni yangila (o'zbekcha, qisqa hisobot), `main` ga commit + push qil — limit kutilmaganda tugasa ham ish yo'qolmasin.
5. TO'XTAMA: darhol keyingi bosqichga o't va 2–4 ni takrorla. Limit tugaguncha yoki 11 bosqich tugaguncha shunday davom et.
6. Bosqich o'rtasida ham har katta qadamdan keyin commit + push qil; tugallanmagan bosqichni `PROGRESS.md` ga "qisman" deb yoz — keyingi ishga tushishda davom ettiriladi.
7. Tugatganda `Ishlayapti:` qatorini `yo'q` ga qaytar, push qil va foydalanuvchiga o'zbekcha qisqa hisobot yubor.

## Texnik qoidalar
- Tashqi kutubxona yo'q (npm install ishlamaydi). Faqat vanilla JS, ES modullar, Canvas.
- O'yin mantig'i `src/logic/` da — DOM/Canvas'ga bog'liq emas, Node'da test qilinadi.
- Grafika, ovoz — faqat original (kod orqali chizilgan/generatsiya qilingan).
- Testlar: `npm test` (`node --test tests/*.test.js`).
- Eski ishlab turgan narsani buzma: har o'zgarishdan keyin hamma testlar o'tishi shart.
