// Reklama sozlamalari. Pul topish uchun shu yerga o'z ID'laringizni yozing (batafsil: ADS.md).
export const ADS_CONFIG = {
  // 'auto'  — Google Play ilovasida (Capacitor + AdMob) AdMob, saytda AdSense H5 (agar clientId yozilgan bo'lsa), aks holda reklamasiz
  // 'h5'    — faqat AdSense H5 Games Ads (sayt / GitHub Pages)
  // 'admob' — faqat AdMob (Capacitor ilova)
  // 'demo'  — sinov: 3 soniyalik soxta reklama oynasi (pul keltirmaydi)
  // 'none'  — reklama yo'q, mukofot darhol beriladi
  provider: 'auto',
  h5: {
    clientId: '',          // masalan 'ca-pub-1234567890123456' (AdSense → H5 Games Ads)
    testMode: false,       // true — AdSense sinov rejimi (data-adbreak-test="on")
  },
  admob: {
    rewardedId: '',        // masalan 'ca-app-pub-xxx/yyy'
    interstitialId: '',
    testing: false,
  },
  // Reklama bo'lmasa (provayder yo'q) mukofotni baribir berish — o'yinchi "aldandim" demasin.
  grantWhenUnavailable: true,
};
