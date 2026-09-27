/**
 * BROKOLI KAHRAMAN – Level Data & World Structure
 * Full 50-level platforming architecture with multi-area horizontal progression,
 * checkpoints, puzzles, levers, switches, destructibles, rescues, secrets, and boss arenas.
 */

export const SCREEN_WIDTH = 1280;

export interface CheckpointDef {
  id: string;
  x: number;
  y: number;
  title: string;
}

export interface PlatformDef {
  id?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  type?: 'zemin_1' | 'zemin_2' | 'zemin_3_buz' | 'zemin_4_fabrika' | 'zemin_5_kale' | 'hareketli' | 'asansor';
  moving?: { dx: number; dy: number; speed: number };
  isBridge?: boolean;
  startsHidden?: boolean;
}

export interface HazardDef {
  x: number;
  y: number;
  type: 'diken' | 'varil';
}

export interface EnemyDef {
  id: string;
  x: number;
  y: number;
  type: 'ketcap' | 'hardal' | 'mayonez';
  hp?: number;
  patrolDist?: number;
  speed?: number;
}

export interface CoinDef {
  x: number;
  y: number;
}

export interface StarItemDef {
  id: string;
  x: number;
  y: number;
  isSecret?: boolean;
}

export interface KeyDef {
  id: string;
  x: number;
  y: number;
  name?: string;
}

export interface LeverDef {
  id: string;
  x: number;
  y: number;
  targetDoorId?: string;
  targetBridgeId?: string;
  label?: string;
}

export interface ButtonDef {
  id: string;
  x: number;
  y: number;
  targetDoorId?: string;
  label?: string;
}

export interface CrateDef {
  id: string;
  x: number;
  y: number;
  isDestructible?: boolean;
  dropsCoin?: boolean;
}

export interface PlateDef {
  id: string;
  x: number;
  y: number;
  targetDoorId: string;
}

export interface DoorDef {
  id: string;
  x: number;
  y: number;
  requiresKeyId?: string;
  requiresLeverId?: string;
  requiresSwitches?: string[];
  isLocked: boolean;
  label?: string;
}

export interface SignDef {
  x: number;
  y: number;
  title: string;
  text: string;
}

export interface RescueDef {
  characterId: string;
  name: string;
  asset: string;
  x: number;
  y: number;
  rescueText: string;
  requiresKeyId?: string;
  requiresLeverId?: string;
}

export interface SecretAreaDef {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  revealText: string;
}

export interface LevelDef {
  id: number;
  world: number;
  title: string;
  description: string;
  background: string;
  width: number;
  spawn: { x: number; y: number };
  checkpoints: CheckpointDef[];
  signs: SignDef[];
  platforms: PlatformDef[];
  hazards: HazardDef[];
  enemies: EnemyDef[];
  coins: CoinDef[];
  stars: StarItemDef[];
  keys: KeyDef[];
  levers: LeverDef[];
  buttons: ButtonDef[];
  crates: CrateDef[];
  plates: PlateDef[];
  doors: DoorDef[];
  rescueCage?: RescueDef;
  secretAreas: SecretAreaDef[];
  exitPortal: {
    x: number;
    y: number;
    requiresRescue?: boolean;
    requiresKeyId?: string;
    objectiveText: string;
  };
  targetTime: number;
  isBossLevel?: boolean;
  bossType?: 'ketcap' | 'hardal' | 'mayonez' | 'muhafiz' | 'hamburger_krali';
}

export interface WorldInfo {
  id: number;
  name: string;
  subtitle: string;
  background: string;
  theme: 'zemin_1' | 'zemin_2' | 'zemin_3_buz' | 'zemin_4_fabrika' | 'zemin_5_kale';
  bossName: string;
  bossLevel: number;
  color: string;
}

export const WORLDS: WorldInfo[] = [
  {
    id: 1,
    name: 'Yeşil Vadi',
    subtitle: 'Maceranın Başlangıcı & Domates ile Biberin Kurtarılışı',
    background: 'world_01_yesil_vadi',
    theme: 'zemin_1',
    bossName: 'Ketçap Patronu',
    bossLevel: 10,
    color: '#4caf50',
  },
  {
    id: 2,
    name: 'Çiftlik Bölgesi',
    subtitle: 'Sandıklar, Ağırlık Plakaları & Mısır ile Soğan',
    background: 'world_02_ciftlik_bolgesi',
    theme: 'zemin_2',
    bossName: 'Hardal Patronu',
    bossLevel: 20,
    color: '#f59e0b',
  },
  {
    id: 3,
    name: 'Sos Fabrikası',
    subtitle: 'Bantlar, Basınçlı Borular & Patlıcan ile Salatalık',
    background: 'world_03_sos_fabrikasi',
    theme: 'zemin_4_fabrika',
    bossName: 'Mayonez Patronu',
    bossLevel: 30,
    color: '#8b5cf6',
  },
  {
    id: 4,
    name: 'Buzluk Bölgesi',
    subtitle: 'Kaygan Zeminler, Buz Blokları & Bezelye ile Mantar',
    background: 'world_04_buzluk_bolgesi',
    theme: 'zemin_3_buz',
    bossName: 'Sos Muhafızı',
    bossLevel: 40,
    color: '#38bdf8',
  },
  {
    id: 5,
    name: 'Hamburger Kalesi',
    subtitle: 'Büyük Final: Hamburger Kral & Havuç Kurtarılıyor!',
    background: 'world_05_hamburger_kalesi',
    theme: 'zemin_5_kale',
    bossName: 'Hamburger Kral (Büyük Final)',
    bossLevel: 50,
    color: '#e11d48',
  },
];

export const friendsCatalog = [
  { id: 'domates', name: 'Domates Dost', asset: '/assets/brokoli/02_characters/domates_dost.png', speech: 'Harikasın Brokoli! Ketçap bizi buraya hapsetmişti! Yeşil Vadi seni bekliyor!' },
  { id: 'biber', name: 'Kırmızı Biber', asset: '/assets/brokoli/02_characters/biber_dost.png', speech: 'Çok teşekkürler süper kahraman! Hamburger Kral Havuç\'u en üst kuleye götürdü!' },
  { id: 'misir', name: 'Tatlı Mısır', asset: '/assets/brokoli/02_characters/misir_dost.png', speech: 'Sımsıcak teşekkürler! Hardal buralara tuzaklar kurdu, sandıkları iyi kullan!' },
  { id: 'sogan', name: 'Mor Soğan', asset: '/assets/brokoli/02_characters/sogan_dost.png', speech: 'Ağlamaktan gözlerim şişmişti, beni kurtardın dostum! İleriye doğru koş!' },
  { id: 'patlican', name: 'Şef Patlıcan', asset: '/assets/brokoli/02_characters/patlican_dost.png', speech: 'Fabrika boruları mayonez dolu, enerjinle engelleri kır!' },
  { id: 'salatalik', name: 'Havalı Salatalık', asset: '/assets/brokoli/02_characters/salatalik_dost.png', speech: 'Kral adamsın Brokoli! Serinliğimi borçluyum! Kaleye çok az kaldı!' },
  { id: 'bezelye', name: 'Bezelye Kardeşler', asset: '/assets/brokoli/02_characters/bezelye_dost.png', speech: 'Buz gibi donmuştuk! Havuç seni bekliyor, acele et kahraman!' },
  { id: 'mantar', name: 'Minik Mantar', asset: '/assets/brokoli/02_characters/mantar_dost.png', speech: 'Teşekkürler süper brokoli! Kalenin ana kapısı yakında açılacak!' },
  { id: 'havuc', name: 'Havuç (Sevgili)', asset: '/assets/brokoli/02_characters/havuc_kiz_arkadas.png', speech: 'Brokoli! Geleceğini biliyordum! Sebzeler artık güvende ve özgür!' },
];

/**
 * MASTER LEVEL 1 IMPLEMENTATION
 * 5 Full Screens Wide (6400px), 9 Distinct Horizontal Areas
 */
function createMasterLevel1(): LevelDef {
  const floorY = 660;
  const floorTop = 610;

  return {
    id: 1,
    world: 1,
    title: 'Bölüm 1 – Yeşil Vadi: Büyük Başlangıç',
    description: 'Yeşil Vadi boyunca sağa doğru ilerle, dövüş ve enerji atışını öğren, bulmacaları çöz, Domates Dost\'u kurtar ve çıkış portalına ulaş!',
    background: 'world_01_yesil_vadi',
    width: 6400, // 5 Full Screens
    spawn: { x: 180, y: floorTop - 40 },
    targetTime: 120,

    // AREA 1 & 4 CHECKPOINTS
    checkpoints: [
      { id: 'cp_1_1', x: 2000, y: floorTop - 40, title: 'Kontrol Noktası 1 – Nehir Kıyısı' },
      { id: 'cp_1_2', x: 4200, y: floorTop - 40, title: 'Kontrol Noktası 2 – Mekanizma Köprüsü' },
    ],

    // TUTORIAL SIGNS
    signs: [
      { x: 300, y: floorTop - 40, title: 'HAREKET REHBERİ', text: '[A] / [D] ile Sağa-Sola Yürü, [SPACE] ile Zıpla!' },
      { x: 900, y: floorTop - 40, title: 'DASH & HIZ', text: '[SHIFT] tuşuna basarak Hızlı Atılma (Dash) yap!' },
      { x: 1550, y: floorTop - 40, title: 'DÖVÜŞ EĞİTİMİ', text: '[X] veya Sol Tık ile Yakın Dövüş Vuruşu yap!' },
      { x: 2300, y: floorTop - 40, title: 'ENERJİ ATIŞI', text: '[E] ile Yeşil Brokoli Enerji Topu Fırlat!' },
      { x: 3400, y: floorTop - 40, title: 'ETKİLEŞİM', text: '[F] ile Kaldıraçları, Sandıkları ve Kafesleri Aç!' },
    ],

    // PLATFORMS & GEOGRAPHY
    platforms: [
      // Screen 1: Safe Arrival Floor
      { x: 640, y: floorY, width: 1300, height: 100, type: 'zemin_1' },
      { x: 600, y: 500, width: 160, height: 34, type: 'zemin_1' },
      { x: 860, y: 410, width: 180, height: 34, type: 'zemin_1' },
      { x: 1120, y: 490, width: 160, height: 34, type: 'zemin_1' },

      // Screen 2: Stepping Ledges & First Enemy Zone
      { x: 1950, y: floorY, width: 1300, height: 100, type: 'zemin_1' },
      { x: 1500, y: 490, width: 180, height: 34, type: 'zemin_1' },
      { x: 1780, y: 400, width: 200, height: 34, type: 'zemin_1' },
      { x: 2060, y: 320, width: 220, height: 34, type: 'zemin_1' },
      { x: 2340, y: 440, width: 180, height: 34, type: 'zemin_1' },

      // Screen 3: Spike Chasm with Upper Highway & Drawbridge
      { x: 2900, y: floorY, width: 600, height: 100, type: 'zemin_1' },
      { x: 3700, y: floorY, width: 600, height: 100, type: 'zemin_1' },
      // Lower gap safety stepping ledge
      { x: 3300, y: 540, width: 140, height: 32, type: 'zemin_1' },
      // Upper highway
      { x: 2800, y: 460, width: 180, height: 34, type: 'zemin_1' },
      { x: 3100, y: 380, width: 200, height: 34, type: 'zemin_1' },
      { x: 3400, y: 380, width: 200, height: 34, type: 'zemin_1' },
      { x: 3700, y: 460, width: 180, height: 34, type: 'zemin_1' },

      // Screen 4: Mechanism Bridge, Secret Cloud Route & Rescue Ledge
      { x: 4450, y: floorY, width: 900, height: 100, type: 'zemin_1' },
      // Drawbridge controlled by Lever L1
      { id: 'bridge_lvl1', x: 4000, y: floorTop - 10, width: 220, height: 26, type: 'hareketli', isBridge: true, startsHidden: true },
      // Gliding Moving Platform
      { x: 4550, y: 440, width: 170, height: 36, type: 'hareketli', moving: { dx: 180, dy: 0, speed: 65 } },
      // Secret Area Platforms (High Above)
      { x: 4400, y: 250, width: 180, height: 30, type: 'zemin_1' },
      { x: 4680, y: 190, width: 220, height: 30, type: 'zemin_1' },
      { x: 4960, y: 250, width: 180, height: 30, type: 'zemin_1' },

      // Rescue Stage Platform
      { x: 5350, y: 470, width: 260, height: 36, type: 'zemin_1' },
      { x: 5350, y: floorY, width: 900, height: 100, type: 'zemin_1' },

      // Screen 5: Final Stretch, Moving Elevator & Victory Gate
      { x: 5800, y: 460, width: 180, height: 34, type: 'asansor', moving: { dx: 0, dy: -100, speed: 50 } },
      { x: 6100, y: floorY, width: 800, height: 100, type: 'zemin_1' },
      { x: 6150, y: 480, width: 240, height: 36, type: 'zemin_1' },
    ],

    // HAZARDS (SPIKES)
    hazards: [
      { x: 3150, y: floorTop - 18, type: 'diken' },
      { x: 3250, y: floorTop - 18, type: 'diken' },
      { x: 3350, y: floorTop - 18, type: 'diken' },
      { x: 3450, y: floorTop - 18, type: 'diken' },
      { x: 4750, y: floorTop - 18, type: 'diken' },
    ],

    // ENEMIES (PATROLLING MINIONS WITH HP)
    enemies: [
      // Screen 2 Combat Encounter
      { id: 'en_1_1', x: 1900, y: floorTop - 30, type: 'ketcap', hp: 2, patrolDist: 120, speed: 60 },
      { id: 'en_1_2', x: 2350, y: 400, type: 'ketcap', hp: 2, patrolDist: 80, speed: 50 },
      // Screen 3 Enemy Guardian
      { id: 'en_1_3', x: 3250, y: 340, type: 'hardal', hp: 3, patrolDist: 90, speed: 55 },
      // Screen 4 Rescue Area Guardian
      { id: 'en_1_4', x: 5150, y: floorTop - 30, type: 'mayonez', hp: 3, patrolDist: 100, speed: 65 },
      // Screen 5 Final Stretch Guardian
      { id: 'en_1_5', x: 5950, y: floorTop - 30, type: 'hardal', hp: 3, patrolDist: 80, speed: 60 },
    ],

    // COINS PLACED ACROSS ALL 9 AREAS
    coins: [
      { x: 450, y: floorTop - 25 },
      { x: 600, y: 440 },
      { x: 730, y: floorTop - 25 },
      { x: 860, y: 350 },
      { x: 1000, y: floorTop - 25 },
      { x: 1120, y: 430 },
      { x: 1500, y: 430 },
      { x: 1780, y: 340 },
      { x: 2060, y: 260 },
      { x: 2200, y: floorTop - 25 },
      { x: 2340, y: 380 },
      { x: 2800, y: 400 },
      { x: 3100, y: 320 },
      { x: 3400, y: 320 },
      { x: 3700, y: 400 },
      // Secret Area Coins
      { x: 4400, y: 190 },
      { x: 4600, y: 130 },
      { x: 4680, y: 130 },
      { x: 4760, y: 130 },
      { x: 4960, y: 190 },
      // Final Stretch Coins
      { x: 5350, y: 410 },
      { x: 5550, y: floorTop - 25 },
      { x: 5750, y: floorTop - 25 },
      { x: 6050, y: floorTop - 25 },
      { x: 6150, y: 420 },
      { x: 6250, y: floorTop - 25 },
    ],

    // STARS
    stars: [
      { id: 'star_lvl1_main', x: 2060, y: 220, isSecret: false },
      { id: 'star_lvl1_secret', x: 4680, y: 100, isSecret: true },
      { id: 'star_lvl1_final', x: 6150, y: 360, isSecret: false },
    ],

    // KEYS
    keys: [
      { id: 'key_cage_1', x: 3400, y: 300, name: 'Kafes Anahtarı' },
    ],

    // LEVERS
    levers: [
      { id: 'lever_bridge_1', x: 3750, y: floorTop - 45, targetBridgeId: 'bridge_lvl1', label: 'Köprü Kaldıracı' },
    ],

    // BUTTONS
    buttons: [
      { id: 'btn_secret_1', x: 4400, y: 220, targetDoorId: 'secret_door_1', label: 'Gizli Düğme' },
    ],

    // DESTRUCTIBLE & PUSHABLE CRATES
    crates: [
      { id: 'crate_d_1', x: 1250, y: floorTop - 26, isDestructible: true, dropsCoin: true },
      { id: 'crate_d_2', x: 2600, y: floorTop - 26, isDestructible: true, dropsCoin: true },
      { id: 'crate_push_1', x: 4250, y: floorTop - 26, isDestructible: false },
    ],

    // PRESSURE PLATES
    plates: [
      { id: 'plate_1', x: 4500, y: floorTop - 12, targetDoorId: 'gate_plate_1' },
    ],

    // GATES / DOORS
    doors: [
      { id: 'gate_plate_1', x: 4800, y: floorTop - 50, isLocked: true, label: 'Ağırlık Kapısı' },
    ],

    // RESCUE TARGET: DOMATES DOST
    rescueCage: {
      characterId: 'domates',
      name: 'Domates Dost',
      asset: '/assets/brokoli/02_characters/domates_dost.png',
      x: 5350,
      y: 410,
      rescueText: 'Harikasın Brokoli! Ketçap bizi buraya hapsetmişti! Yeşil Vadi artık güvende!',
      requiresKeyId: 'key_cage_1',
    },

    // SECRET AREA
    secretAreas: [
      {
        id: 'sec_1',
        x: 4350,
        y: 80,
        width: 650,
        height: 220,
        revealText: 'GİZLİ GÖKYÜZÜ ROTASI KEŞFEDİLDİ! 🌟',
      },
    ],

    // LEVEL EXIT PORTAL
    exitPortal: {
      x: 6250,
      y: floorTop - 50,
      requiresRescue: true,
      objectiveText: 'Domates Dost\'u kurtar ve Çıkış Portalına ulaş!',
    },
  };
}

/**
 * Generate all 50 levels with rich structured horizontal platforming data
 */
function generateAll50Levels(): LevelDef[] {
  const levels: LevelDef[] = [];
  const floorY = 660;
  const floorTop = 610;

  // Level 1 is the handcrafted master level
  levels.push(createMasterLevel1());

  for (let id = 2; id <= 50; id++) {
    const world = Math.ceil(id / 10);
    const worldIndex = (id - 1) % 10 + 1;
    const isBoss = worldIndex === 10;
    const theme = WORLDS[world - 1].theme;
    const bg = WORLDS[world - 1].background;

    // --- BOSS ARENA LEVELS (10, 20, 30, 40, 50) ---
    if (isBoss) {
      let bossType: LevelDef['bossType'] = 'ketcap';
      if (world === 2) bossType = 'hardal';
      else if (world === 3) bossType = 'mayonez';
      else if (world === 4) bossType = 'muhafiz';
      else if (world === 5) bossType = 'hamburger_krali';

      levels.push({
        id,
        world,
        title: `Bölüm ${id} – ${WORLDS[world - 1].bossName}`,
        description: `Büyük Savaş! ${WORLDS[world - 1].bossName}'na karşı 3 aşamalı taktik boss mücadelesi!`,
        background: bg,
        width: 2560, // 2 screen arena
        spawn: { x: 240, y: floorTop - 40 },
        targetTime: 150,
        isBossLevel: true,
        bossType,
        checkpoints: [{ id: `cp_boss_${id}`, x: 240, y: floorTop - 40, title: 'Boss Arenası Girişi' }],
        signs: [{ x: 360, y: floorTop - 40, title: 'DİKKAT!', text: 'Patronun kalkanını kırmak için platformlardaki kaldıraçları aktif et!' }],
        platforms: [
          { x: 1280, y: floorY, width: 2600, height: 100, type: theme },
          { x: 500, y: 470, width: 240, height: 36, type: theme },
          { x: 2060, y: 470, width: 240, height: 36, type: theme },
          { x: 1280, y: 340, width: 320, height: 36, type: theme },
        ],
        hazards: [],
        enemies: [],
        coins: [
          { x: 500, y: 410 },
          { x: 1280, y: 280 },
          { x: 2060, y: 410 },
        ],
        stars: [{ id: `star_boss_${id}`, x: 1280, y: 220, isSecret: false }],
        keys: [],
        levers: [
          { id: `lever_boss_left_${id}`, x: 500, y: 430, label: 'Kalkan Aşırı Yükleme Sol' },
          { id: `lever_boss_right_${id}`, x: 2060, y: 430, label: 'Kalkan Aşırı Yükleme Sağ' },
        ],
        buttons: [],
        crates: [],
        plates: [],
        doors: [],
        secretAreas: [],
        exitPortal: {
          x: 2350,
          y: floorTop - 50,
          objectiveText: `${WORLDS[world - 1].bossName}'nu yen ve kapıyı aç!`,
        },
      });
      continue;
    }

    // --- STANDARD 5-8 SCREEN HORIZONTAL PROGRESSION LEVEL (5120px - 7680px) ---
    const levelScreens = 5 + (worldIndex % 3); // 5 to 7 screens
    const width = levelScreens * SCREEN_WIDTH;

    const platforms: PlatformDef[] = [];
    const hazards: HazardDef[] = [];
    const enemies: EnemyDef[] = [];
    const coins: CoinDef[] = [];
    const stars: StarItemDef[] = [];
    const keys: KeyDef[] = [];
    const levers: LeverDef[] = [];
    const buttons: ButtonDef[] = [];
    const crates: CrateDef[] = [];
    const plates: PlateDef[] = [];
    const doors: DoorDef[] = [];
    const checkpoints: CheckpointDef[] = [];
    const signs: SignDef[] = [];
    const secretAreas: SecretAreaDef[] = [];

    // Continuous Ground with Chasms
    for (let s = 0; s < levelScreens; s++) {
      const screenStartX = s * SCREEN_WIDTH;
      const screenCenterX = screenStartX + SCREEN_WIDTH / 2;

      // Floor segments
      if (s === 0 || s === levelScreens - 1 || s % 2 === 0) {
        platforms.push({
          x: screenCenterX,
          y: floorY,
          width: SCREEN_WIDTH + 40,
          height: 100,
          type: theme,
        });
      } else {
        platforms.push(
          { x: screenStartX + 360, y: floorY, width: 700, height: 100, type: theme },
          { x: screenStartX + 1060, y: floorY, width: 440, height: 100, type: theme }
        );
        // Safety step platform inside gap
        platforms.push({
          x: screenStartX + 750,
          y: 530,
          width: 140,
          height: 32,
          type: theme,
        });
        hazards.push({ x: screenStartX + 750, y: floorTop - 18, type: 'diken' });
      }

      // Mid-level checkpoints at screen 2 and screen 4
      if (s === 2 || s === 4) {
        checkpoints.push({
          id: `cp_${id}_${s}`,
          x: screenStartX + 200,
          y: floorTop - 40,
          title: `Kontrol Noktası ${s / 2}`,
        });
      }

      // Platforms per screen
      platforms.push(
        { x: screenStartX + 280, y: 490 - (s % 3) * 30, width: 180, height: 34, type: theme },
        { x: screenStartX + 640, y: 400 - (s % 2) * 40, width: 200, height: 34, type: (s % 2 === 1) ? 'hareketli' : theme, moving: (s % 2 === 1) ? { dx: 140, dy: 0, speed: 60 } : undefined },
        { x: screenStartX + 1000, y: 470 - (s % 3) * 20, width: 180, height: 34, type: theme }
      );

      // Enemies
      if (s > 0 && s < levelScreens - 1) {
        const enType = (world === 1 ? 'ketcap' : world === 2 ? 'hardal' : 'mayonez') as 'ketcap' | 'hardal' | 'mayonez';
        enemies.push({
          id: `en_${id}_s${s}`,
          x: screenStartX + 640,
          y: floorTop - 30,
          type: enType,
          hp: 2 + Math.floor(worldIndex / 4),
          patrolDist: 90,
          speed: 55 + world * 5,
        });
      }

      // Collectible coins
      coins.push(
        { x: screenStartX + 280, y: 430 - (s % 3) * 30 },
        { x: screenStartX + 460, y: floorTop - 25 },
        { x: screenStartX + 640, y: 340 - (s % 2) * 40 },
        { x: screenStartX + 820, y: floorTop - 25 },
        { x: screenStartX + 1000, y: 410 - (s % 3) * 20 }
      );

      // Crates
      if (s % 2 === 1) {
        crates.push({
          id: `crate_${id}_${s}`,
          x: screenStartX + 460,
          y: floorTop - 26,
          isDestructible: true,
          dropsCoin: true,
        });
      }
    }

    // Secret Area in Screen 3 (if levelScreens >= 4)
    const secScreen = Math.min(3, levelScreens - 2);
    const secBaseX = secScreen * SCREEN_WIDTH + 300;

    // Secret high sky platforms
    platforms.push(
      { x: secBaseX + 120, y: 220, width: 180, height: 32, type: theme },
      { x: secBaseX + 340, y: 160, width: 220, height: 32, type: theme }
    );

    // Secret Area Coins
    coins.push(
      { x: secBaseX + 120, y: 170 },
      { x: secBaseX + 240, y: 120 },
      { x: secBaseX + 340, y: 110 },
      { x: secBaseX + 440, y: 110 }
    );

    // Secret Star inside secret area
    stars.push(
      { id: `star_${id}_1`, x: SCREEN_WIDTH + 640, y: 320, isSecret: false },
      { id: `star_${id}_2`, x: secBaseX + 340, y: 110, isSecret: true },
      { id: `star_${id}_3`, x: (levelScreens - 1) * SCREEN_WIDTH + 500, y: 380, isSecret: false }
    );

    secretAreas.push({
      id: `secret_${id}`,
      x: secBaseX,
      y: 80,
      width: 520,
      height: 220,
      revealText: 'GİZLİ ALAN KEŞFEDİLDİ! 🌟',
    });

    // Rescue Friend for designated levels
    let rescue: RescueDef | undefined = undefined;
    const rescueIndex = [2, 6, 12, 16, 22, 26, 32, 36, 48].indexOf(id);
    if (rescueIndex !== -1 && rescueIndex < friendsCatalog.length) {
      const f = friendsCatalog[rescueIndex];
      const rescueScreen = Math.floor(levelScreens / 2);
      rescue = {
        characterId: f.id,
        name: f.name,
        asset: f.asset,
        x: rescueScreen * SCREEN_WIDTH + 640,
        y: 320,
        rescueText: f.speech,
        requiresKeyId: id % 2 === 0 ? `key_rescue_${id}` : undefined,
      };

      if (id % 2 === 0) {
        keys.push({
          id: `key_rescue_${id}`,
          x: (rescueScreen - 1) * SCREEN_WIDTH + 800,
          y: 280,
          name: 'Kafes Anahtarı',
        });
      }
    }

    // Levers & Gates
    const hasLeverPuzzle = worldIndex % 2 === 0;
    if (hasLeverPuzzle) {
      const puzzleScreen = 2;
      levers.push({
        id: `lever_${id}`,
        x: puzzleScreen * SCREEN_WIDTH + 280,
        y: floorTop - 45,
        targetDoorId: `door_${id}`,
        label: 'Geçit Kaldıracı',
      });
      doors.push({
        id: `door_${id}`,
        x: puzzleScreen * SCREEN_WIDTH + 1150,
        y: floorTop - 50,
        requiresLeverId: `lever_${id}`,
        isLocked: true,
        label: 'Kilitli Demir Geçit',
      });
    }

    // Exit Portal
    const exitX = (levelScreens - 1) * SCREEN_WIDTH + 960;
    const exitY = floorTop - 50;

    levels.push({
      id,
      world,
      title: `Bölüm ${id} – ${levelTitles[worldIndex - 1] || 'Büyük Macera'}`,
      description: `${WORLDS[world - 1].name} bölgesinde ${levelScreens} ekran boyunca ilerle, engelleri aş ve bölüm finaline ulaş!`,
      background: bg,
      width,
      spawn: { x: 180, y: floorTop - 40 },
      checkpoints,
      signs,
      platforms,
      hazards,
      enemies,
      coins,
      stars,
      keys,
      levers,
      buttons,
      crates,
      plates,
      doors,
      rescueCage: rescue,
      secretAreas,
      exitPortal: {
        x: exitX,
        y: exitY,
        requiresRescue: rescue !== undefined,
        objectiveText: rescue ? `${rescue.name}'ı kurtar ve çıkışa ulaş!` : 'Tüm engelleri aşarak Çıkış Portalına ulaş!',
      },
      targetTime: 90 + worldIndex * 8,
      isBossLevel: false,
    });
  }

  return levels;
}

const levelTitles = [
  'Büyük Başlangıç',
  'Gizli Geçit',
  'Yüksek Platformlar',
  'Mekanizma Yolu',
  'Tehlikeli Vadi',
  'Dostun Çağrısı',
  'Zamanla Yarış',
  'Kayıp Anahtar',
  'Patron Kapısı Önü',
  'BÜYÜK BOSS SAVAŞI',
];

export const ALL_LEVELS: LevelDef[] = generateAll50Levels();

export function getLevelById(id: number): LevelDef {
  return ALL_LEVELS.find((lvl) => lvl.id === id) || ALL_LEVELS[0];
}
