// Tillar: English (asosiy), O'zbekcha, Русский, Türkçe. Telefon tiliga qarab avtomatik tanlanadi.
export const LANGS = ['en', 'uz', 'ru', 'tr'];

const S = {
  en: {
    'city.khiva': 'Khiva', 'city.bukhara': 'Bukhara', 'city.samarkand': 'Samarkand', 'city.shahrisabz': 'Shahrisabz',
    'city.tashkent': 'Tashkent', 'city.kokand': 'Kokand', 'city.termez': 'Termez', 'city.eternal': 'Eternal Road',
    'fact.khiva': 'Itchan Kala, the walled inner town of Khiva, was the first site in Uzbekistan added to the UNESCO World Heritage List (1990).',
    'fact.bukhara': 'The Kalon Minaret in Bukhara was built in 1127 and stands about 47 metres tall.',
    'fact.samarkand': 'Registan Square is framed by three madrasahs: Ulugh Beg, Sher-Dor and Tilya-Kori.',
    'fact.shahrisabz': 'Shahrisabz is the birthplace of Amir Timur, who built the grand Ak-Saray palace here.',
    'fact.tashkent': 'The Tashkent Metro opened in 1977 — the first in Central Asia — and its stations are decorated like palaces.',
    'fact.kokand': 'The Khudayar Khan Palace in Kokand was built in the 19th century and is famous for its glazed tiles.',
    'fact.termez': 'Termez is one of the oldest cities in Uzbekistan — more than 2,500 years old.',
    'fact.eternal': 'The caravan never stops: new roads appear forever.',
    'goal.score': 'Score', 'goal.lines': 'Lines', 'goal.gems': 'Gems', 'goal.ice': 'Ice', 'goal.stone': 'Stones', 'goal.chain': 'Chains', 'goal.build': 'Build',
    'level': 'Level', 'boss': 'Boss',
  },
  uz: {
    'city.khiva': 'Xiva', 'city.bukhara': 'Buxoro', 'city.samarkand': 'Samarqand', 'city.shahrisabz': 'Shahrisabz',
    'city.tashkent': 'Toshkent', 'city.kokand': "Qo'qon", 'city.termez': 'Termiz', 'city.eternal': "Abadiy yo'l",
    'fact.khiva': "Xivadagi Ichan qal'a — O'zbekistondan YUNESKO Jahon merosi ro'yxatiga birinchi kiritilgan obyekt (1990).",
    'fact.bukhara': "Buxorodagi Kalon minorasi 1127-yilda qurilgan, balandligi qariyb 47 metr.",
    'fact.samarkand': "Registon maydonini uchta madrasa o'rab turadi: Ulug'bek, Sherdor va Tillakori.",
    'fact.shahrisabz': "Shahrisabz — Amir Temurning tug'ilgan yurti; u bu yerda ulug'vor Oqsaroyni qurdirgan.",
    'fact.tashkent': "Toshkent metrosi 1977-yilda ochilgan — Markaziy Osiyoda birinchi, bekatlari saroylardek bezatilgan.",
    'fact.kokand': "Qo'qondagi Xudoyorxon saroyi XIX asrda qurilgan va sirlangan koshinlari bilan mashhur.",
    'fact.termez': "Termiz — O'zbekistonning eng qadimiy shaharlaridan biri, yoshi 2500 yildan oshadi.",
    'fact.eternal': "Karvon to'xtamaydi: yangi yo'llar cheksiz paydo bo'laveradi.",
    'goal.score': 'Ochko', 'goal.lines': 'Qatorlar', 'goal.gems': 'Olmoslar', 'goal.ice': 'Muz', 'goal.stone': 'Toshlar', 'goal.chain': 'Zanjirlar', 'goal.build': 'Qurish',
    'level': 'Bosqich', 'boss': 'Boss',
  },
  ru: {
    'city.khiva': 'Хива', 'city.bukhara': 'Бухара', 'city.samarkand': 'Самарканд', 'city.shahrisabz': 'Шахрисабз',
    'city.tashkent': 'Ташкент', 'city.kokand': 'Коканд', 'city.termez': 'Термез', 'city.eternal': 'Вечный путь',
    'fact.khiva': 'Ичан-Кала в Хиве — первый объект Узбекистана, внесённый в список Всемирного наследия ЮНЕСКО (1990).',
    'fact.bukhara': 'Минарет Калян в Бухаре построен в 1127 году, его высота около 47 метров.',
    'fact.samarkand': 'Площадь Регистан окружают три медресе: Улугбека, Шердор и Тилля-Кари.',
    'fact.shahrisabz': 'Шахрисабз — родина Амира Темура, построившего здесь величественный дворец Ак-Сарай.',
    'fact.tashkent': 'Ташкентское метро открылось в 1977 году — первое в Центральной Азии, станции украшены как дворцы.',
    'fact.kokand': 'Дворец Худояр-хана в Коканде построен в XIX веке и славится глазурованной плиткой.',
    'fact.termez': 'Термез — один из древнейших городов Узбекистана, ему более 2500 лет.',
    'fact.eternal': 'Караван не останавливается: новые дороги появляются бесконечно.',
    'goal.score': 'Очки', 'goal.lines': 'Линии', 'goal.gems': 'Самоцветы', 'goal.ice': 'Лёд', 'goal.stone': 'Камни', 'goal.chain': 'Цепи', 'goal.build': 'Стройка',
    'level': 'Уровень', 'boss': 'Босс',
  },
  tr: {
    'city.khiva': 'Hive', 'city.bukhara': 'Buhara', 'city.samarkand': 'Semerkant', 'city.shahrisabz': 'Şehrisebz',
    'city.tashkent': 'Taşkent', 'city.kokand': 'Hokand', 'city.termez': 'Tirmiz', 'city.eternal': 'Sonsuz Yol',
    'fact.khiva': "Hive'deki İçan Kale, Özbekistan'dan UNESCO Dünya Mirası Listesi'ne giren ilk yerdir (1990).",
    'fact.bukhara': "Buhara'daki Kalan Minaresi 1127'de inşa edildi ve yaklaşık 47 metre yüksekliğindedir.",
    'fact.samarkand': 'Registan Meydanı üç medreseyle çevrilidir: Uluğ Bey, Şir-Dar ve Tilla-Kari.',
    'fact.shahrisabz': "Şehrisebz, Emir Timur'un doğduğu yerdir; görkemli Ak Saray'ı burada yaptırdı.",
    'fact.tashkent': "Taşkent Metrosu 1977'de açıldı — Orta Asya'nın ilki — ve istasyonları saray gibi süslüdür.",
    'fact.kokand': "Hokand'daki Hudayar Han Sarayı 19. yüzyılda yapıldı ve sırlı çinileriyle ünlüdür.",
    'fact.termez': "Tirmiz, Özbekistan'ın en eski şehirlerinden biridir — 2.500 yıldan daha yaşlıdır.",
    'fact.eternal': 'Kervan hiç durmaz: yeni yollar sonsuza dek belirir.',
    'goal.score': 'Puan', 'goal.lines': 'Sıralar', 'goal.gems': 'Mücevherler', 'goal.ice': 'Buz', 'goal.stone': 'Taşlar', 'goal.chain': 'Zincirler', 'goal.build': 'İnşa',
    'level': 'Seviye', 'boss': 'Boss',
  },
};

// Telefon tillari ro'yxatidan mos tilni tanlash (masalan ['uz-Latn-UZ', 'ru-RU'] → 'uz').
export function pickLanguage(prefs = []) {
  for (const p of prefs) {
    if (!p) continue;
    const base = String(p).toLowerCase().split(/[-_]/)[0];
    if (LANGS.includes(base)) return base;
  }
  return 'en';
}

let current = 'en';
export function setLanguage(l) { current = LANGS.includes(l) ? l : 'en'; }
export function getLanguage() { return current; }

export function t(key, lang = current) {
  return (S[lang] && S[lang][key]) ?? S.en[key] ?? key;
}

export function addStrings(lang, dict) { Object.assign(S[lang] ||= {}, dict); }
export const STRINGS = S;
