import Phaser from 'phaser';
import { EventBus } from './systems/EventBus';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const { width, height } = this.cameras.main;

    this.cameras.main.setBackgroundColor('#0b1329');

    const titleText = this.add.text(width / 2, height / 2 - 80, 'BROKOLİ KAHRAMAN', {
      fontFamily: "'Lilita One', 'Russo One', 'Fredoka', sans-serif",
      fontSize: '46px',
      color: '#4ade80',
      fontStyle: 'bold',
      stroke: '#064e3b',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 4, color: '#022c22', blur: 6, fill: true, stroke: true },
    }).setOrigin(0.5);

    const subText = this.add.text(width / 2, height / 2 - 30, 'Sebzeler Hazırlanıyor...', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '20px',
      color: '#e2e8f0',
    }).setOrigin(0.5);

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x1e293b, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 + 10, 320, 24, 12);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x22c55e, 1);
      progressBar.fillRoundedRect(width / 2 - 156, height / 2 + 14, 312 * value, 16, 8);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      titleText.destroy();
      subText.destroy();
      EventBus.emit('assets_loaded');
    });

    // 1. BRAND
    this.load.image('feature_banner', '/assets/brokoli/01_brand/feature_banner.png');
    this.load.image('android_icon', '/assets/brokoli/01_brand/android_icon.png');

    // 2. CHARACTERS
    this.load.image('brokoli_kahraman', '/assets/brokoli/02_characters/brokoli_kahraman.png');
    this.load.image('havuc_kiz_arkadas', '/assets/brokoli/02_characters/havuc_kiz_arkadas.png');
    this.load.image('havuc', '/assets/brokoli/02_characters/havuc_kiz_arkadas.png');
    this.load.image('havuc_dost', '/assets/brokoli/02_characters/havuc_kiz_arkadas.png');

    this.load.image('domates', '/assets/brokoli/02_characters/domates_dost.png');
    this.load.image('domates_dost', '/assets/brokoli/02_characters/domates_dost.png');

    this.load.image('misir', '/assets/brokoli/02_characters/misir_dost.png');
    this.load.image('misir_dost', '/assets/brokoli/02_characters/misir_dost.png');

    this.load.image('sogan', '/assets/brokoli/02_characters/sogan_dost.png');
    this.load.image('sogan_dost', '/assets/brokoli/02_characters/sogan_dost.png');

    this.load.image('biber', '/assets/brokoli/02_characters/biber_dost.png');
    this.load.image('biber_dost', '/assets/brokoli/02_characters/biber_dost.png');

    this.load.image('patlican', '/assets/brokoli/02_characters/patlican_dost.png');
    this.load.image('patlican_dost', '/assets/brokoli/02_characters/patlican_dost.png');

    this.load.image('bezelye', '/assets/brokoli/02_characters/bezelye_dost.png');
    this.load.image('bezelye_dost', '/assets/brokoli/02_characters/bezelye_dost.png');

    this.load.image('mantar', '/assets/brokoli/02_characters/mantar_dost.png');
    this.load.image('mantar_dost', '/assets/brokoli/02_characters/mantar_dost.png');

    this.load.image('salatalik', '/assets/brokoli/02_characters/salatalik_dost.png');
    this.load.image('salatalik_dost', '/assets/brokoli/02_characters/salatalik_dost.png');

    // 3. ENEMIES & BOSSES
    this.load.image('ketcap', '/assets/brokoli/03_enemies_bosses/ketcap.png');
    this.load.image('hardal', '/assets/brokoli/03_enemies_bosses/hardal.png');
    this.load.image('mayonez', '/assets/brokoli/03_enemies_bosses/mayonez.png');
    this.load.image('hamburger_krali', '/assets/brokoli/03_enemies_bosses/hamburger_krali.png');

    // 4. WORLDS & BACKGROUNDS
    this.load.image('world_01_yesil_vadi', '/assets/brokoli/04_worlds/world_01_yesil_vadi.png');
    this.load.image('world_02_ciftlik_bolgesi', '/assets/brokoli/04_worlds/world_02_ciftlik_bolgesi.png');
    this.load.image('world_03_sos_fabrikasi', '/assets/brokoli/04_worlds/world_03_sos_fabrikasi.png');
    this.load.image('world_04_buzluk_bolgesi', '/assets/brokoli/04_worlds/world_04_buzluk_bolgesi.png');
    this.load.image('world_05_hamburger_kalesi', '/assets/brokoli/04_worlds/world_05_hamburger_kalesi.png');

    // 5. ENVIRONMENT & PLATFORMS
    this.load.image('zemin_1', '/assets/brokoli/05_environment/zemin_1.png');
    this.load.image('zemin_2', '/assets/brokoli/05_environment/zemin_2.png');
    this.load.image('zemin_3_buz', '/assets/brokoli/05_environment/zemin_3_buz.png');
    this.load.image('zemin_4_fabrika', '/assets/brokoli/05_environment/zemin_4_fabrika.png');
    this.load.image('zemin_5_kale', '/assets/brokoli/05_environment/zemin_5_kale.png');
    this.load.image('hareketli_platform', '/assets/brokoli/05_environment/hareketli_platform.png');
    this.load.image('asansor', '/assets/brokoli/05_environment/asansor.png');
    this.load.image('kafes', '/assets/brokoli/05_environment/kafes.png');
    this.load.image('kilitli_kapi', '/assets/brokoli/05_environment/kilitli_kapi.png');
    this.load.image('anahtar', '/assets/brokoli/05_environment/anahtar.png');
    this.load.image('altin_para', '/assets/brokoli/05_environment/altin_para.png');
    this.load.image('yildiz', '/assets/brokoli/05_environment/yildiz.png');
    this.load.image('buton', '/assets/brokoli/05_environment/buton.png');
    this.load.image('kaldirac', '/assets/brokoli/05_environment/kaldirac.png');
    this.load.image('diken', '/assets/brokoli/05_environment/diken.png');
    this.load.image('ahsap_kutu', '/assets/brokoli/05_environment/ahsap_kutu.png');
    this.load.image('kirilabilir_kutu', '/assets/brokoli/05_environment/kirilabilir_kutu.png');
    this.load.image('varil', '/assets/brokoli/05_environment/varil.png');
    this.load.image('kontrol_paneli', '/assets/brokoli/05_environment/kontrol_paneli.png');
    this.load.image('yon_oku', '/assets/brokoli/05_environment/yon_oku.png');

    // 6. UI
    this.load.image('can_icon', '/assets/brokoli/07_ui/can_icon.png');
    this.load.image('para_icon', '/assets/brokoli/07_ui/para_icon.png');
    this.load.image('yildiz_icon', '/assets/brokoli/07_ui/yildiz_icon.png');
    this.load.image('anahtar_icon', '/assets/brokoli/07_ui/anahtar_icon.png');
    this.load.image('duraklat_icon', '/assets/brokoli/07_ui/duraklat_icon.png');
  }

  create() {
    EventBus.emit('boot_ready');
  }
}
