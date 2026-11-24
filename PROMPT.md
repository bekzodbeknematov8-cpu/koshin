Sen tajribali mobil o'yin dasturchisisan. Men bilan birga "Koshin: Silk Road Puzzle" nomli 2D puzzle o'yinini yaratamiz. O'yin blok-puzzle janridan (Block Blast kabi) ilhomlangan, lekin uning nusxasi EMAS: nomi, dizayni, ranglari va mexanikalari o'zimizniki bo'lsin. Boshqa o'yinlarning grafikasi, ovozlari yoki nomlaridan foydalanma.

=== TEXNOLOGIYA ===
- HTML5 + JavaScript (Canvas), PWA. Telefonda brauzerda ishlasin, internetsiz ham o'ynalsin, keyin Google Play'ga o'rash mumkin bo'lsin.
- O'yin mantig'ini (logic) grafikadan alohida modulga yoz, shunda uni avtomatik test qilish oson bo'ladi.
- Silliq 60 FPS, kuchsiz telefonlarda ham tez ishlasin.

=== NOM VA DIZAYN (MILLIY, LEKIN BUTUN DUNYO UCHUN) ===
- Mavzu: O'zbekiston va Buyuk Ipak Yo'li.
- Bloklar sirlangan koshin plitkalarga o'xshasin: moviy, firuza, oltin, oq ranglar, islimiy/girih naqshlar.
- Barcha grafika ORIGINAL bo'lsin (SVG/Canvas'da chiz), internetdan rasm olma.
- Fon: kechki Samarqand osmoni, gumbaz va minora siluetlari. Sokin rangda bo'lsin, maydonni bosib ketmasin.
- Qator tozalanganda plitkalar oltin chang bo'lib sochilsin. Combo yozuvlari, telefon tebranishi bo'lsin.
- Musiqa va ovozlar dutor/rubob uslubida, original va qisqa. Ovozni o'chirish tugmasi bo'lsin.
- Tillar: English (asosiy), O'zbekcha, Русский, Türkçe. Telefon tiliga qarab avtomatik tanlansin.
- O'yinni tushunish uchun matn deyarli kerak bo'lmasin: belgi va animatsiyalar orqali tushunarli bo'lsin.

=== ASOSIY O'YIN ===
- 8x8 maydon. Pastda 3 ta shakl beriladi, o'yinchi ularni sudrab maydonga qo'yadi.
- To'lgan qator yoki ustun tozalanadi. Bir yurishda bir nechta qator tozalansa COMBO, ketma-ket tozalashlar STREAK (ko'paytiruvchi) bo'ladi.
- Adolatlilik: shakl generatori, ayniqsa dastlabki bosqichlarda, kamida bitta joylashtirish mumkin bo'lgan shaklni kafolatlasin. O'yinchi "o'yin meni aldadi" deb his qilmasin.
- To'siqlar: muz (2 marta tozalash kerak), tosh (faqat yonidagi qator tozalansa sinadi), zanjir, olmos (yig'iladi).
- Kuchaytirgichlar: Bomba (3x3), Bolg'a (1 katak), Aylantirish, Shaklni almashtirish. Ular tangalar evaziga olinadi.

=== 1-REJIM: SARGUZASHT (TUGAMAYDIGAN BOSQICHLAR) ===
- Xarita Ipak Yo'li bo'ylab: Xiva → Buxoro → Samarqand → Shahrisabz → Toshkent → Qo'qon → Termiz.
- Har shahar — 20 bosqichli bitta dunyo. Har birining o'z rangi va yangi mexanikasi bor.
- Har bosqichning maqsadi bo'ladi: X ochko, N ta olmos, muzlarni sindirish va hokazo. Yurishlar soni cheklangan, natijaga qarab 1–3 yulduz beriladi.
- Qiyinlik asta oshadi: avval o'rgatish bosqichlari, keyin muz, tosh, zanjir va kattaroq shakllar.
- Har shaharning oxirgi bosqichi BOSS bosqich: o'yinchi shaharning mashhur binosini koshinlar bilan "qayta quradi". Bosqichlar o'tilgan sari bino xaritada asta bezalib boradi.
- Har shahar ekranida o'sha shahar haqida bitta qisqa qiziqarli fakt bo'lsin.
- Shaharlar tugagach "Abadiy yo'l" boshlanadi: generator cheksiz yangi bosqichlar yaratadi, qiyinlik sekin va adolatli o'sib boradi.
- Bosqichlarni qo'lda emas, qoida (generator) asosida yarat.

=== 2-REJIM: KUNLIK NAQSH ===
- Har kuni HAMMA o'yinchiga bir xil boshqotirma beriladi (sana asosidagi seed).
- Kuniga 1 urinish, reklama ko'rib yana 1 ta.
- Natijadan keyin ulashish tugmasi chiqsin: emoji to'r ko'rinishida, masalan "Koshin #128 🟦🟨🟦 2450".
- Ketma-ket kunlar seriyasi (streak) va 7-kun mukofoti bo'lsin.

=== 3-REJIM: CHEKSIZ ===
- Yurishlar cheklanmagan, maqsad — eng yuqori ochko.
- Shaxsiy rekord saqlansin. Keyinchalik global reyting qo'shish uchun API joyi tayyorlab qo'yilsin.

=== QO'SHIMCHA ===
- Kundalik topshiriqlar, kirish mukofoti, yutuqlar (achievements).
- Reklama uchun faqat joy tayyorla (rewarded: "reklama ko'r — qo'shimcha yurish ol"). Majburiy reklama qo'yma.
- Barcha natijalar telefonda saqlansin (localStorage).

=== ISH TARTIBI (JUDA MUHIM) ===
Ishni quyidagi bosqichlarga bo'l. Har bosqichda:
 1) Kodni yoz.
 2) O'yin mantig'i uchun avtomatik testlar yoz va ishga tushir.
 3) Xatolarni top va TUZAT. Testlar to'liq o'tmaguncha keyingi bosqichga O'TMA.
 4) Menga qisqa hisobot ber: nima qilindi, qanday xato tuzatildi.
 5) Keyin keyingi bosqichga o't.

BOSQICHLAR:
 1. Loyiha tuzilmasi, 8x8 maydon, shakllarni sudrab qo'yish (sensor ekran + sichqoncha)
 2. Qator/ustun tozalash, ochko, combo, streak, o'yin tugashi
 3. Shakl generatori va adolatlilik qoidasi
 4. Koshin dizayni: plitkalar, fon, ranglar, animatsiyalar
 5. Sarguzasht: bosqich generatori, maqsadlar, yulduzlar, Ipak Yo'li xaritasi
 6. To'siqlar, boss bosqichlar, binoni qayta qurish, "Abadiy yo'l"
 7. Kuchaytirgichlar va tanga tizimi
 8. Kunlik Naqsh va ulashish; Cheksiz rejim
 9. Topshiriqlar, yutuqlar, ovoz/musiqa, tebranish, menyu, sozlamalar, 4 til
10. Saqlash, PWA, internetsiz ishlash, tezlikni optimallashtirish
11. Yakuniy umumiy test, keyin GitHub Pages'ga joylash yo'riqnomasi

=== O'YIN TAYYOR BO'LGANDAN KEYIN ===
- Menga o'yinni telefonda ochish uchun havolani yoki oson yo'lni ber.
- O'zim o'ynab tekshirishim uchun qisqa ro'yxat ber: nimalarni sinab ko'rishim kerak.
- Men xatolar, kamchiliklar va takliflarni yozib yuboraman. Sen ularni ro'yxatga ol, muhimligiga qarab tartibla, birma-bir tuzat, har biridan keyin testla va nima o'zgarganini qisqa aytib ber.
- Bu jarayonni o'yin menga to'liq yoqmaguncha takrorlaymiz. Har tuzatishdan keyin eski ishlab turgan narsalar buzilmaganini tekshir.

Boshlashdan oldin rejani qisqa ko'rsat, keyin 1-bosqichdan boshla.