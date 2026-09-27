/**
 * Boss configurations, phases, and combat behaviors
 * Exactly maps to public/assets/brokoli/03_enemies_bosses/
 */

export interface BossPhase {
  phaseNum: number;
  maxHealth: number;
  attackSpeed: number;
  patternName: string;
  description: string;
}

export interface BossProfile {
  id: 'ketcap' | 'hardal' | 'mayonez' | 'muhafiz' | 'hamburger_krali';
  name: string;
  title: string;
  asset: string;
  textureKey: string;
  phases: BossPhase[];
  totalHealth: number;
  introQuote: string;
  defeatQuote: string;
}

export const BOSS_PROFILES: Record<string, BossProfile> = {
  ketcap: {
    id: 'ketcap',
    name: 'Ketçap Patronu',
    title: 'Hızlı & Öfkeli Sos Muhafızı',
    asset: '/assets/brokoli/03_enemies_bosses/ketcap.png',
    textureKey: 'ketcap',
    totalHealth: 6,
    introQuote: 'Brokoli! Buradan canlı çıkamayacaksın! Üzerine bol ketçap sıkacağım!',
    defeatQuote: 'Puff! Olamaz... Sebzeler benden daha taze çıktı...',
    phases: [
      { phaseNum: 1, maxHealth: 2, attackSpeed: 2000, patternName: 'Ketçap Topları', description: 'Brokoli\'ye doğru sıçrayan ketçap topları fırlatır!' },
      { phaseNum: 2, maxHealth: 2, attackSpeed: 1600, patternName: 'Yere Vurma & Sos Alanı', description: 'Havaya sıçrayıp yere vurur, zeminde tehlikeli kırmızı sos bırakır!' },
      { phaseNum: 3, maxHealth: 2, attackSpeed: 1200, patternName: 'Öfkeli İleri Hücum', description: 'Bütün gücüyle hızla sağa sola hücum eder!' },
    ],
  },
  hardal: {
    id: 'hardal',
    name: 'Hardal Patronu',
    title: 'Kaygan Zemin Ustası',
    asset: '/assets/brokoli/03_enemies_bosses/hardal.png',
    textureKey: 'hardal',
    totalHealth: 7,
    introQuote: 'Hardalın keskin tadına hazır mısın brokoli çocuk? Kayıp düşeceksin!',
    defeatQuote: 'Acı sonum geldi... Çiftlik senin olsun...',
    phases: [
      { phaseNum: 1, maxHealth: 2, attackSpeed: 2200, patternName: 'Kaygan Hardal Dalgası', description: 'Zemini kayganlaştırıp sağa sola dalgalar gönderir!' },
      { phaseNum: 2, maxHealth: 2, attackSpeed: 1700, patternName: 'Hardal Bariyerleri', description: 'Zemini geçici olarak kapatan hardal duvarları çıkarır!' },
      { phaseNum: 3, maxHealth: 3, attackSpeed: 1300, patternName: 'Hızlı Spiral Sprey', description: 'Her yöne döner fıskiye hardal damlaları saçar!' },
    ],
  },
  mayonez: {
    id: 'mayonez',
    name: 'Mayonez Patronu',
    title: 'Ağır & Yapışkan Fabrika Şefi',
    asset: '/assets/brokoli/03_enemies_bosses/mayonez.png',
    textureKey: 'mayonez',
    totalHealth: 8,
    introQuote: 'Mayonezden kaçış yok! Fabrikamda sonsuza dek yapışıp kalacaksın!',
    defeatQuote: 'Puff! Kremamsı gücüm tükendi...',
    phases: [
      { phaseNum: 1, maxHealth: 2, attackSpeed: 2400, patternName: 'Yapışkan Alan', description: 'Hareket hızını düşüren beyaz mayonez göletleri bırakır!' },
      { phaseNum: 2, maxHealth: 3, attackSpeed: 1800, patternName: 'Kavanoz Ezmesi', description: 'Büyük gövdesiyle havadan oyuncunun üstüne iner!' },
      { phaseNum: 3, maxHealth: 3, attackSpeed: 1300, patternName: 'Güdümlü Krema Bombaları', description: 'Havadan ardı ardına 3 krema bombası yağdırır!' },
    ],
  },
  muhafiz: {
    id: 'muhafiz',
    name: 'Sos Fabrikası Muhafızı',
    title: 'Üçlü Kombine Buharlı Robot',
    asset: '/assets/brokoli/03_enemies_bosses/ketcap.png',
    textureKey: 'ketcap',
    totalHealth: 9,
    introQuote: 'BİP BUP! Ketçap + Hardal + Mayonez protokolü aktif! Sebzeler imha edilecek!',
    defeatQuote: 'SİSTEM ÇÖKTÜ... DİŞLİLER DURDU...',
    phases: [
      { phaseNum: 1, maxHealth: 3, attackSpeed: 2000, patternName: 'Üçlü Sos Salvoları', description: 'Ketçap ve hardalı aynı anda çaprazlama ateşler!' },
      { phaseNum: 2, maxHealth: 3, attackSpeed: 1600, patternName: 'Buharlı Dişli Hücumu', description: 'Gövdesindeki dev dişlileri döndürerek platformu tarar!' },
      { phaseNum: 3, maxHealth: 3, attackSpeed: 1200, patternName: 'Aşırı Yükleme', description: 'Tüm tankları aynı anda boşaltır, oyuncu zayıf noktaya vurmalıdır!' },
    ],
  },
  hamburger_krali: {
    id: 'hamburger_krali',
    name: 'Hamburger Kralı',
    title: 'Fast-Food İmparatorluğunun Hükümdarı (Final Boss)',
    asset: '/assets/brokoli/03_enemies_bosses/hamburger_krali.png',
    textureKey: 'hamburger_krali',
    totalHealth: 10,
    introQuote: 'HAHAHA! Minik bir brokoli koca krallığıma meydan mı okuyor? Havuç asla serbest kalmayacak!',
    defeatQuote: 'HAYIRRR! Kutsal Burger Tacım düştü! Sebzeler... kazandı...',
    phases: [
      { phaseNum: 1, maxHealth: 3, attackSpeed: 2000, patternName: 'Minyon Çağrısı & Peynir Dalgası', description: 'Patates minyonlarını sahaya sürer ve erimiş peynir dalgaları gönderir!' },
      { phaseNum: 2, maxHealth: 3, attackSpeed: 1500, patternName: 'Kraliyet Ekmeği Ezmesi', description: 'Dev taçlı ekmeğiyle havaya yükselip sarsıcı şok dalgaları üretir!' },
      { phaseNum: 3, maxHealth: 4, attackSpeed: 1100, patternName: 'Arena Bölünmesi & Son Hesaplaşma', description: 'Arenayı ikiye böler; kalkanını indirmek için mekanizmayı çöz ve son vuruşu yap!',
      },
    ],
  },
};
