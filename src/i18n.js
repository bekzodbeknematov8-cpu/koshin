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

// Parametrli matn: t('quest.lines', { n: 10 }) → "Clear 10 lines"
export function tf(key, params = {}, lang) {
  return t(key, lang).replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? String(params[k]) : '{' + k + '}'));
}

addStrings('en', {
  'title': 'Koshin', 'subtitle': 'Silk Road Puzzle',
  'menu.play': 'Adventure', 'menu.daily': 'Daily Pattern', 'menu.endless': 'Endless', 'menu.quests': 'Quests', 'menu.achievements': 'Achievements', 'menu.settings': 'Settings',
  'set.sound': 'Sound', 'set.music': 'Music', 'set.vibration': 'Vibration', 'set.language': 'Language',
  'quest.lines': 'Clear {n} lines', 'quest.pieces': 'Place {n} pieces', 'quest.combos': 'Make {n} combos', 'quest.levelsWon': 'Win {n} levels',
  'quest.stars': 'Earn {n} stars', 'quest.powerups': 'Use {n} power-ups', 'quest.dailyPlayed': 'Play the Daily Pattern', 'quest.gems': 'Collect {n} gems',
  'login.title': 'Daily gift', 'login.day': 'Day {n}',
  'ach.first_line': 'First Line', 'ach.lines_100': 'Tile Setter', 'ach.lines_1000': 'Master Tiler', 'ach.combo_3': 'Triple Combo', 'ach.combo_4': 'Quad Combo',
  'ach.perfect': 'Spotless Courtyard', 'ach.levels_10': 'Caravan Starts', 'ach.levels_50': 'Seasoned Traveller', 'ach.stars_100': 'Star Gazer',
  'ach.boss_1': 'First Monument', 'ach.boss_7': 'Builder of the Silk Road', 'ach.endless_2000': 'Long Road', 'ach.endless_10000': 'Endless Caravan',
  'ach.daily_7': 'Faithful Week', 'ach.gems_50': 'Jeweller', 'ach.ice_50': 'Ice Breaker', 'ach.stones_50': 'Stonemason', 'ach.powerups_20': 'Clever Tools',
});
addStrings('uz', {
  'title': 'Koshin', 'subtitle': "Ipak Yo'li boshqotirmasi",
  'menu.play': 'Sarguzasht', 'menu.daily': 'Kunlik Naqsh', 'menu.endless': 'Cheksiz', 'menu.quests': 'Topshiriqlar', 'menu.achievements': 'Yutuqlar', 'menu.settings': 'Sozlamalar',
  'set.sound': 'Ovoz', 'set.music': 'Musiqa', 'set.vibration': 'Tebranish', 'set.language': 'Til',
  'quest.lines': '{n} ta qator tozalang', 'quest.pieces': '{n} ta shakl qo\'ying', 'quest.combos': '{n} ta combo qiling', 'quest.levelsWon': '{n} ta bosqichni yuting',
  'quest.stars': '{n} ta yulduz to\'plang', 'quest.powerups': '{n} ta kuchaytirgich ishlating', 'quest.dailyPlayed': 'Kunlik Naqshni o\'ynang', 'quest.gems': '{n} ta olmos yig\'ing',
  'login.title': 'Kunlik sovg\'a', 'login.day': '{n}-kun',
  'ach.first_line': 'Birinchi qator', 'ach.lines_100': 'Koshinkor', 'ach.lines_1000': 'Usta koshinkor', 'ach.combo_3': 'Uchlik combo', 'ach.combo_4': "To'rtlik combo",
  'ach.perfect': 'Toza hovli', 'ach.levels_10': "Karvon yo'lga chiqdi", 'ach.levels_50': 'Tajribali sayyoh', 'ach.stars_100': 'Yulduzshunos',
  'ach.boss_1': 'Birinchi obida', 'ach.boss_7': "Ipak Yo'li me'mori", 'ach.endless_2000': "Uzoq yo'l", 'ach.endless_10000': 'Cheksiz karvon',
  'ach.daily_7': 'Sodiq hafta', 'ach.gems_50': 'Zargar', 'ach.ice_50': 'Muzyorar', 'ach.stones_50': 'Toshtarosh', 'ach.powerups_20': 'Epchil usta',
});
addStrings('ru', {
  'title': 'Koshin', 'subtitle': 'Головоломка Шёлкового пути',
  'menu.play': 'Приключение', 'menu.daily': 'Узор дня', 'menu.endless': 'Бесконечный', 'menu.quests': 'Задания', 'menu.achievements': 'Достижения', 'menu.settings': 'Настройки',
  'set.sound': 'Звук', 'set.music': 'Музыка', 'set.vibration': 'Вибрация', 'set.language': 'Язык',
  'quest.lines': 'Очистите {n} линий', 'quest.pieces': 'Поставьте {n} фигур', 'quest.combos': 'Сделайте {n} комбо', 'quest.levelsWon': 'Пройдите {n} уровней',
  'quest.stars': 'Соберите {n} звёзд', 'quest.powerups': 'Используйте {n} усилений', 'quest.dailyPlayed': 'Сыграйте Узор дня', 'quest.gems': 'Соберите {n} самоцветов',
  'login.title': 'Ежедневный подарок', 'login.day': 'День {n}',
  'ach.first_line': 'Первая линия', 'ach.lines_100': 'Плиточник', 'ach.lines_1000': 'Мастер плитки', 'ach.combo_3': 'Тройное комбо', 'ach.combo_4': 'Четверное комбо',
  'ach.perfect': 'Чистый двор', 'ach.levels_10': 'Караван в пути', 'ach.levels_50': 'Бывалый путник', 'ach.stars_100': 'Звездочёт',
  'ach.boss_1': 'Первый памятник', 'ach.boss_7': 'Зодчий Шёлкового пути', 'ach.endless_2000': 'Долгий путь', 'ach.endless_10000': 'Бесконечный караван',
  'ach.daily_7': 'Верная неделя', 'ach.gems_50': 'Ювелир', 'ach.ice_50': 'Ледокол', 'ach.stones_50': 'Каменотёс', 'ach.powerups_20': 'Ловкие инструменты',
});
addStrings('tr', {
  'title': 'Koshin', 'subtitle': 'İpek Yolu Bulmacası',
  'menu.play': 'Macera', 'menu.daily': 'Günün Deseni', 'menu.endless': 'Sonsuz', 'menu.quests': 'Görevler', 'menu.achievements': 'Başarılar', 'menu.settings': 'Ayarlar',
  'set.sound': 'Ses', 'set.music': 'Müzik', 'set.vibration': 'Titreşim', 'set.language': 'Dil',
  'quest.lines': '{n} sıra temizle', 'quest.pieces': '{n} parça yerleştir', 'quest.combos': '{n} kombo yap', 'quest.levelsWon': '{n} seviye kazan',
  'quest.stars': '{n} yıldız topla', 'quest.powerups': '{n} güçlendirici kullan', 'quest.dailyPlayed': 'Günün Desenini oyna', 'quest.gems': '{n} mücevher topla',
  'login.title': 'Günlük hediye', 'login.day': '{n}. gün',
  'ach.first_line': 'İlk Sıra', 'ach.lines_100': 'Çini Ustası', 'ach.lines_1000': 'Büyük Çini Ustası', 'ach.combo_3': 'Üçlü Kombo', 'ach.combo_4': 'Dörtlü Kombo',
  'ach.perfect': 'Tertemiz Avlu', 'ach.levels_10': 'Kervan Yolda', 'ach.levels_50': 'Deneyimli Yolcu', 'ach.stars_100': 'Yıldız Gözlemcisi',
  'ach.boss_1': 'İlk Anıt', 'ach.boss_7': 'İpek Yolu Mimarı', 'ach.endless_2000': 'Uzun Yol', 'ach.endless_10000': 'Sonsuz Kervan',
  'ach.daily_7': 'Sadık Hafta', 'ach.gems_50': 'Kuyumcu', 'ach.ice_50': 'Buz Kıran', 'ach.stones_50': 'Taş Ustası', 'ach.powerups_20': 'Becerikli Aletler',
});

export const LANG_NAMES = { en: 'English', uz: "O'zbekcha", ru: 'Русский', tr: 'Türkçe' };

// Charxpalak va reklama matnlari
addStrings('en', { 'menu.wheel': 'Lucky Wheel', 'menu.freeCoins': 'Free coins', 'ad.limit': 'No more ads today', 'ad.fail': 'Ad unavailable, try later', 'ad.label': 'Ad', 'ad.tapClose': 'Tap to continue', 'wheel.free': 'Free spin!', 'wheel.again': 'Spin again', 'wheel.tomorrow': 'Come back tomorrow', 'over.revive': 'Second chance' });
addStrings('uz', { 'menu.wheel': 'Omad charxi', 'menu.freeCoins': 'Bepul tanga', 'ad.limit': 'Bugungi reklamalar tugadi', 'ad.fail': "Reklama yo'q, keyinroq urinib ko'ring", 'ad.label': 'Reklama', 'ad.tapClose': 'Davom etish uchun bosing', 'wheel.free': 'Bepul aylantirish!', 'wheel.again': 'Yana aylantirish', 'wheel.tomorrow': 'Ertaga qayting', 'over.revive': 'Ikkinchi imkoniyat' });
addStrings('ru', { 'menu.wheel': 'Колесо удачи', 'menu.freeCoins': 'Монеты', 'ad.limit': 'Реклама на сегодня закончилась', 'ad.fail': 'Реклама недоступна, попробуйте позже', 'ad.label': 'Реклама', 'ad.tapClose': 'Нажмите, чтобы продолжить', 'wheel.free': 'Бесплатный спин!', 'wheel.again': 'Ещё раз', 'wheel.tomorrow': 'Возвращайтесь завтра', 'over.revive': 'Второй шанс' });
addStrings('tr', { 'menu.wheel': 'Şans Çarkı', 'menu.freeCoins': 'Bedava altın', 'ad.limit': 'Bugünlük reklam bitti', 'ad.fail': 'Reklam yok, sonra deneyin', 'ad.label': 'Reklam', 'ad.tapClose': 'Devam için dokun', 'wheel.free': 'Bedava çevir!', 'wheel.again': 'Tekrar çevir', 'wheel.tomorrow': 'Yarın gel', 'over.revive': 'İkinci şans' });
