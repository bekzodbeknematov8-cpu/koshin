# Koshin'ni GitHub Pages'ga joylash (telefonda ochish uchun)

O'yin — oddiy statik sayt (HTML + JS), server yoki "build" kerak emas. GitHub Pages bepul joylaydi.

## 1. GitHub Pages'ni yoqish (bir marta, ~2 daqiqa)
1. Brauzerda repo'ni oching: https://github.com/bekzodbeknematov8-cpu/koshin
2. **Settings** → chap menyuda **Pages**.
3. **Build and deployment → Source**: `Deploy from a branch`.
4. **Branch**: `main`, papka: `/ (root)` → **Save**.
5. 1–2 daqiqadan keyin sahifa tepasida havola chiqadi:
   **https://bekzodbeknematov8-cpu.github.io/koshin/**

> Repo **public** bo'lishi kerak (bepul tarifda Pages faqat ochiq repolarda ishlaydi).

## 2. Telefonda ochish va ilova sifatida o'rnatish
- Havolani telefonda oching (Chrome yoki Safari).
- **Android (Chrome)**: ⋮ menyu → **Bosh ekranga qo'shish / Ilovani o'rnatish**.
- **iPhone (Safari)**: Ulashish ⬆ → **Bosh ekranga qo'shish**.
- Bir marta ochilgandan keyin o'yin **internetsiz** ham ishlaydi (service worker barcha fayllarni saqlaydi).

## 3. Yangilanishlar
- `main` ga har push'dan keyin Pages o'zi yangilanadi (1–2 daqiqa).
- Telefonda yangi versiya ilovani ikki marta qayta ochgandan keyin ko'rinadi (birinchi ochishda yangi fayllar fonda yuklanadi).
- Kod o'zgarganda `npm run build` ni ishga tushirish shart (sw.js dagi fayllar ro'yxati va kesh versiyasi yangilanadi; buni test ham tekshiradi).

## 4. Kompyuterda sinash
```bash
npm test            # mantiq testlari (node --test)
npm run serve       # http://localhost:8080 — brauzerda oching
npm run smoke       # brauzer tutun testi (Playwright o'rnatilgan bo'lsa)
node tools/e2e.mjs  # to'liq o'yin oqimi testi (Playwright)
```

## 5. Keyinchalik: Google Play
O'yin PWA bo'lgani uchun uni **Trusted Web Activity (TWA)** sifatida o'rash mumkin:
1. Pages havolasi ishlab turishi kerak.
2. [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) bilan: `bubblewrap init --manifest https://bekzodbeknematov8-cpu.github.io/koshin/manifest.webmanifest` → `bubblewrap build` → `.aab` fayl.
3. Saytga `/.well-known/assetlinks.json` (Bubblewrap beradi) qo'shiladi — shunda manzil satri ko'rinmaydi.
4. Reklama: `src/main.js` dagi `app.ads.showRewarded` — hozir darhol mukofot beradi; haqiqiy reklama SDK shu yerga ulanadi.
5. Global reyting: `src/net/leaderboard.js` dagi `LEADERBOARD.endpoint` ga server manzili yoziladi.
