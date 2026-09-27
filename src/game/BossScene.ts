import Phaser from 'phaser';
import { BOSS_PROFILES, BossProfile } from './bossData';
import { getLevelById, LevelDef } from './levelData';
import { EventBus } from './systems/EventBus';
import { sounds } from './systems/SoundManager';
import { WorldBackgrounds } from './systems/WorldBackgrounds';

export class BossScene extends Phaser.Scene {
  private levelData!: LevelDef;
  private bossProfile!: BossProfile;
  private player!: Phaser.Physics.Arcade.Sprite;
  private boss!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private minions!: Phaser.Physics.Arcade.Group;
  private levers!: Phaser.Physics.Arcade.StaticGroup;

  // Visuals
  private readonly PLAYER_BASE_SCALE = 64 / 512;
  private bossWidth: number = 130;
  private bossHeight: number = 150;
  private bossShieldFx?: Phaser.GameObjects.Graphics;

  // Combat state
  private playerHealth: number = 5;
  private maxPlayerHealth: number = 5;
  private bossHealth: number = 6;
  private maxBossHealth: number = 6;
  private currentPhase: number = 1;
  private isInvincible: boolean = false;
  private isBossShielded: boolean = false;
  private isBossAttacking: boolean = false;
  private isCompleted: boolean = false;
  private isGameOver: boolean = false;
  private battleTimer: number = 0;
  private attackTimerEvent?: Phaser.Time.TimerEvent;
  private timerEvent?: Phaser.Time.TimerEvent;
  private facingLeft: boolean = false;

  // Abilities
  private isDashing: boolean = false;
  private canDash: boolean = true;
  private isAttacking: boolean = false;
  private canAttack: boolean = true;
  private isShootingEnergy: boolean = false;
  private canShootEnergy: boolean = true;
  private leversActivatedInPhase: Set<string> = new Set();

  // Platformer feel
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keyX!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyF!: Phaser.Input.Keyboard.Key;
  private virtualInput = {
    left: false,
    right: false,
    jump: false,
    dash: false,
    attack: false,
    energy: false,
    interact: false,
  };

  constructor() {
    super('BossScene');
  }

  init(data: { levelId: number }) {
    this.levelData = getLevelById(data.levelId || 10);
    const bossTypeKey = this.levelData.bossType || 'ketcap';
    this.bossProfile = BOSS_PROFILES[bossTypeKey] || BOSS_PROFILES.ketcap;
    this.playerHealth = 5;
    this.maxPlayerHealth = 5;
    this.bossHealth = this.bossProfile.totalHealth;
    this.maxBossHealth = this.bossProfile.totalHealth;
    this.currentPhase = 1;
    this.isInvincible = false;
    this.isBossShielded = false;
    this.isBossAttacking = false;
    this.isCompleted = false;
    this.isGameOver = false;
    this.battleTimer = 0;
    this.facingLeft = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.isDashing = false;
    this.canDash = true;
    this.isAttacking = false;
    this.canAttack = true;
    this.isShootingEnergy = false;
    this.canShootEnergy = true;
    this.leversActivatedInPhase.clear();

    if (this.bossProfile.id === 'hamburger_krali') {
      this.bossWidth = 190;
      this.bossHeight = 140;
    } else {
      this.bossWidth = 125;
      this.bossHeight = 155;
    }
  }

  create() {
    const { width, height } = this.scale;

    this.physics.world.setBounds(0, 0, width, height);

    // Boss Battle BGM
    sounds.startBGM(5);

    // Background
    WorldBackgrounds.initWorldTextures(this);
    const wNum = this.levelData.world;
    this.add.image(width / 2, height / 2, `bg_sky_world_${wNum}`).setDisplaySize(width, height);
    this.add.image(width / 2, height / 2, `bg_far_world_${wNum}`).setDisplaySize(width, height);
    this.add.image(width / 2, height / 2, `bg_mid_world_${wNum}`).setDisplaySize(width, height);

    // --- ARENA PLATFORMS ---
    this.platforms = this.physics.add.staticGroup();

    // Solid main floor
    const floor = this.platforms.create(width / 2, 660, 'zemin_5_kale') as Phaser.Physics.Arcade.Sprite;
    floor.setDisplaySize(width, 100);
    floor.refreshBody();

    // Tactical battle ledges
    const ledgeLeft = this.platforms.create(260, 480, 'zemin_5_kale') as Phaser.Physics.Arcade.Sprite;
    ledgeLeft.setDisplaySize(200, 36);
    ledgeLeft.refreshBody();

    const ledgeRight = this.platforms.create(1020, 480, 'zemin_5_kale') as Phaser.Physics.Arcade.Sprite;
    ledgeRight.setDisplaySize(200, 36);
    ledgeRight.refreshBody();

    const ledgeCenter = this.platforms.create(width / 2, 340, 'zemin_5_kale') as Phaser.Physics.Arcade.Sprite;
    ledgeCenter.setDisplaySize(260, 36);
    ledgeCenter.refreshBody();

    // Overload Levers on upper platforms (used in Phase 3)
    this.levers = this.physics.add.staticGroup();
    const levL = this.levers.create(260, 440, 'kaldirac') as Phaser.Physics.Arcade.Sprite;
    levL.setDisplaySize(44, 48);
    levL.refreshBody();
    levL.setData('id', 'boss_lev_1');

    const levR = this.levers.create(1020, 440, 'kaldirac') as Phaser.Physics.Arcade.Sprite;
    levR.setDisplaySize(44, 48);
    levR.refreshBody();
    levR.setData('id', 'boss_lev_2');

    // --- PROJECTILES & MINIONS GROUPS ---
    this.projectiles = this.physics.add.group();
    this.minions = this.physics.add.group();

    // --- PLAYER: BROKOLI HERO ---
    this.player = this.physics.add.sprite(180, 560, 'brokoli_kahraman');
    this.player.setScale(this.PLAYER_BASE_SCALE);
    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    pBody.setSize(320, 420);
    pBody.setOffset(96, 60);
    pBody.setCollideWorldBounds(true);
    pBody.setBounce(0);
    this.player.setGravityY(920);

    // --- BOSS SPRITE ---
    this.boss = this.physics.add.sprite(width - 240, 520, this.bossProfile.textureKey);
    this.boss.setDisplaySize(this.bossWidth, this.bossHeight);
    const bBody = this.boss.body as Phaser.Physics.Arcade.Body;
    bBody.setSize(this.bossWidth * 0.8, this.bossHeight * 0.85);
    bBody.setCollideWorldBounds(true);
    bBody.setImmovable(true);
    bBody.setAllowGravity(false);

    this.bossShieldFx = this.add.graphics();

    // --- COLLISIONS ---
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.minions, this.platforms);
    this.physics.add.collider(this.projectiles, this.platforms, (proj: any) => proj.destroy());

    // --- OVERLAPS ---
    this.physics.add.overlap(this.player, this.boss, this.handlePlayerBossCollision, undefined, this);
    this.physics.add.overlap(this.player, this.projectiles, this.handleProjectileHitPlayer, undefined, this);
    this.physics.add.overlap(this.player, this.minions, this.handleMinionHitPlayer, undefined, this);

    // --- INPUT CONTROLS ---
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.performMeleeAttack();
      }
    });

    // Mobile inputs
    EventBus.on('player_input', (input: typeof this.virtualInput) => {
      this.virtualInput = { ...this.virtualInput, ...input };
    });
    EventBus.on('trigger_attack', () => this.performMeleeAttack());
    EventBus.on('trigger_energy', () => this.performEnergyProjectile());
    EventBus.on('trigger_interact', () => this.performInteract());
    EventBus.on('trigger_dash', () => this.performDash());
    EventBus.on('trigger_jump', () => this.performJump());

    // Battle Timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.isCompleted && !this.isGameOver) {
          this.battleTimer++;
          this.broadcastHUD();
        }
      },
      loop: true,
    });

    // Start Boss AI Loop
    this.startBossCombatLoop();
    this.broadcastHUD();
  }

  update(time: number, delta: number) {
    if (this.isCompleted || this.isGameOver) return;

    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = pBody.blocked.down || pBody.touching.down;

    if (onGround) {
      this.coyoteTimer = 140;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }

    // Input checks
    const moveLeft = this.cursors?.left.isDown || this.keyA?.isDown || this.virtualInput.left;
    const moveRight = this.cursors?.right.isDown || this.keyD?.isDown || this.virtualInput.right;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors?.up) ||
                        Phaser.Input.Keyboard.JustDown(this.keyW) ||
                        Phaser.Input.Keyboard.JustDown(this.keySpace) ||
                        this.virtualInput.jump;
    const jumpHolding = this.cursors?.up.isDown || this.keyW?.isDown || this.keySpace?.isDown || this.virtualInput.jump;
    const doDash = Phaser.Input.Keyboard.JustDown(this.keyShift) || this.virtualInput.dash;
    const doMelee = Phaser.Input.Keyboard.JustDown(this.keyX) || this.virtualInput.attack;
    const doEnergy = Phaser.Input.Keyboard.JustDown(this.keyE) || this.virtualInput.energy;
    const doInteract = Phaser.Input.Keyboard.JustDown(this.keyF) || this.virtualInput.interact;

    if (jumpPressed) {
      this.jumpBufferTimer = 150;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
    }

    // Movement
    let speed = 280;
    if (this.isDashing) speed = 620;

    if (moveLeft) {
      this.player.setVelocityX(-speed);
      this.facingLeft = true;
    } else if (moveRight) {
      this.player.setVelocityX(speed);
      this.facingLeft = false;
    } else if (!this.isDashing) {
      this.player.setVelocityX(0);
    }

    // Jumping
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.player.setVelocityY(-540);
      sounds.playJump();
    }
    if (!jumpHolding && pBody.velocity.y < -160) {
      this.player.setVelocityY(-160);
    }

    if (doDash) this.performDash();
    if (doMelee) this.performMeleeAttack();
    if (doEnergy) this.performEnergyProjectile();
    if (doInteract) this.performInteract();

    // Animation squash & stretch
    const dirSign = this.facingLeft ? -1 : 1;
    this.player.setScale(this.PLAYER_BASE_SCALE * dirSign, this.PLAYER_BASE_SCALE);

    // Boss shield fx
    if (this.bossShieldFx && this.boss) {
      this.bossShieldFx.clear();
      if (this.isBossShielded) {
        const pulse = (Math.sin(time * 0.008) + 1) * 0.5;
        this.bossShieldFx.fillStyle(0x38bdf8, 0.35 + pulse * 0.25);
        this.bossShieldFx.lineStyle(4, 0x0284c7, 0.9);
        this.bossShieldFx.fillCircle(this.boss.x, this.boss.y, this.bossWidth * 0.75 + pulse * 6);
        this.bossShieldFx.strokeCircle(this.boss.x, this.boss.y, this.bossWidth * 0.75 + pulse * 6);
      }
    }
  }

  // --- ACTIONS ---

  public performJump() {
    this.jumpBufferTimer = 150;
  }

  public performDash() {
    if (!this.canDash || this.isDashing) return;
    this.isDashing = true;
    this.canDash = false;
    this.isInvincible = true;
    sounds.playDash();

    const dir = this.facingLeft ? -1 : 1;
    this.player.setVelocityX(dir * 640);
    this.player.setTint(0x67e8f9);

    this.time.delayedCall(220, () => {
      this.isDashing = false;
      this.isInvincible = false;
      this.player.clearTint();
    });

    this.time.delayedCall(750, () => {
      this.canDash = true;
    });
  }

  public performMeleeAttack() {
    if (!this.canAttack || this.isAttacking) return;
    this.isAttacking = true;
    this.canAttack = false;
    sounds.playAttack();

    const dir = this.facingLeft ? -1 : 1;
    const slashX = this.player.x + dir * 50;
    const slashY = this.player.y;

    const slash = this.add.circle(slashX, slashY, 28, 0x4ade80, 0.85);
    this.tweens.add({
      targets: slash,
      scaleX: 2.2,
      scaleY: 0.8,
      alpha: 0,
      duration: 160,
      onComplete: () => slash.destroy(),
    });

    // Check hit on boss
    const distToBoss = Phaser.Math.Distance.Between(slashX, slashY, this.boss.x, this.boss.y);
    if (distToBoss < this.bossWidth * 0.75) {
      this.damageBoss(1);
    }

    // Check hit on minions
    this.minions.getChildren().forEach((child) => {
      const minion = child as Phaser.Physics.Arcade.Sprite;
      if (Phaser.Math.Distance.Between(slashX, slashY, minion.x, minion.y) < 60) {
        sounds.playEnemyHit();
        minion.destroy();
      }
    });

    // Check hit on levers
    this.levers.getChildren().forEach((child) => {
      const lev = child as Phaser.Physics.Arcade.Sprite;
      if (Phaser.Math.Distance.Between(slashX, slashY, lev.x, lev.y) < 60) {
        this.activateBossLever(lev);
      }
    });

    this.time.delayedCall(300, () => {
      this.isAttacking = false;
      this.canAttack = true;
    });
  }

  public performEnergyProjectile() {
    if (!this.canShootEnergy || this.isShootingEnergy) return;
    this.isShootingEnergy = true;
    this.canShootEnergy = false;
    sounds.playEnergyShoot();

    const dir = this.facingLeft ? -1 : 1;
    const proj = this.physics.add.sprite(this.player.x + dir * 35, this.player.y, 'altin_para');
    proj.setDisplaySize(26, 26);
    proj.setTint(0x22c55e);
    const projBody = proj.body as Phaser.Physics.Arcade.Body;
    projBody.setAllowGravity(false);
    proj.setVelocityX(dir * 600);

    this.physics.add.overlap(proj, this.boss, () => {
      sounds.playEnergyHit();
      this.damageBoss(1);
      proj.destroy();
    });

    this.physics.add.overlap(proj, this.minions, (p: any, m: any) => {
      sounds.playEnergyHit();
      m.destroy();
      proj.destroy();
    });

    this.time.delayedCall(800, () => {
      if (proj.active) proj.destroy();
      this.isShootingEnergy = false;
      this.canShootEnergy = true;
    });
  }

  public performInteract() {
    this.levers.getChildren().forEach((child) => {
      const lev = child as Phaser.Physics.Arcade.Sprite;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, lev.x, lev.y) < 90) {
        this.activateBossLever(lev);
      }
    });
  }

  private activateBossLever(lev: Phaser.Physics.Arcade.Sprite) {
    const id = lev.getData('id') as string;
    if (this.leversActivatedInPhase.has(id)) return;

    this.leversActivatedInPhase.add(id);
    lev.setTint(0x22c55e);
    lev.setFlipX(true);
    sounds.playLever();
    this.showFloatingText(lev.x, lev.y - 40, 'KALDIRAÇ AŞIRI YÜKLENDİ! ⚡', '#38bdf8');

    if (this.leversActivatedInPhase.size >= 2 && this.isBossShielded) {
      this.isBossShielded = false;
      sounds.playBossPhase();
      this.cameras.main.flash(350, 56, 189, 248);
      this.showFloatingText(this.boss.x, this.boss.y - 60, 'PATRONUN KALKANI KIRILDI! SALDIR! 💥', '#4ade80');
    }
  }

  // --- BOSS COMBAT LOOP & PHASES ---

  private startBossCombatLoop() {
    this.attackTimerEvent = this.time.addEvent({
      delay: 2400,
      callback: () => this.executeBossPattern(),
      loop: true,
    });
  }

  private executeBossPattern() {
    if (this.isCompleted || this.isGameOver || this.isBossAttacking) return;
    this.isBossAttacking = true;

    if (this.currentPhase === 1) {
      // Phase 1: Ranged Sauce Projectiles & Jump
      this.bossAttackProjectileBarrage();
    } else if (this.currentPhase === 2) {
      // Phase 2: Ground Pound Shockwave + Summon Minions
      if (Math.random() > 0.5) {
        this.bossAttackGroundPound();
      } else {
        this.bossSummonMinions();
      }
    } else {
      // Phase 3: Shield Activation & Mega Barrage
      if (!this.isBossShielded && this.leversActivatedInPhase.size < 2) {
        this.isBossShielded = true;
        this.showFloatingText(this.boss.x, this.boss.y - 60, 'KALKAN AKTİF! KALDIRAÇLARI ÇEK! 🛡️', '#38bdf8');
      }
      this.bossAttackProjectileBarrage();
    }

    this.time.delayedCall(1600, () => {
      this.isBossAttacking = false;
    });
  }

  private bossAttackProjectileBarrage() {
    sounds.playBossPhase();
    const count = this.currentPhase === 3 ? 3 : 2;

    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 300, () => {
        if (!this.boss.active) return;
        const proj = this.projectiles.create(this.boss.x - 40, this.boss.y - 20, 'diken') as Phaser.Physics.Arcade.Sprite;
        proj.setDisplaySize(28, 28);
        const projColor = this.bossProfile.id === 'hardal' ? 0xf59e0b : this.bossProfile.id === 'mayonez' ? 0xe2e8f0 : 0xef4444;
        proj.setTint(projColor);
        const pBody = proj.body as Phaser.Physics.Arcade.Body;
        pBody.setAllowGravity(false);

        const angle = Phaser.Math.Angle.Between(proj.x, proj.y, this.player.x, this.player.y);
        this.physics.velocityFromRotation(angle, 340, pBody.velocity);
      });
    }
  }

  private bossAttackGroundPound() {
    sounds.playBossPhase();
    this.tweens.add({
      targets: this.boss,
      y: 280,
      duration: 400,
      yoyo: true,
      ease: 'Quad.easeInOut',
      onYoyo: () => {
        this.cameras.main.shake(250, 0.02);
        sounds.playLanding();

        // Left & Right Shockwaves
        for (const dir of [-1, 1]) {
          const wave = this.projectiles.create(this.boss.x, 600, 'diken') as Phaser.Physics.Arcade.Sprite;
          wave.setDisplaySize(32, 28);
          wave.setTint(0xef4444);
          const wBody = wave.body as Phaser.Physics.Arcade.Body;
          wBody.setAllowGravity(false);
          wave.setVelocityX(dir * 320);
        }
      },
    });
  }

  private bossSummonMinions() {
    sounds.playBossPhase();
    const m = this.minions.create(this.boss.x - 60, 560, 'ketcap') as Phaser.Physics.Arcade.Sprite;
    m.setDisplaySize(44, 52);
    m.setCollideWorldBounds(true);
    m.setGravityY(750);
    m.setVelocityX(-70);
    this.showFloatingText(m.x, m.y - 30, 'Minyon Çağrıldı!', '#f59e0b');
  }

  private damageBoss(damage: number) {
    if (this.isBossShielded) {
      this.showFloatingText(this.boss.x, this.boss.y - 50, 'Kalkan Zarar Vermeyi Engelliyor! 🛡️', '#38bdf8');
      return;
    }

    this.bossHealth -= damage;
    this.boss.setTint(0xff0000);
    sounds.playBossHit();
    this.cameras.main.shake(140, 0.015);

    this.tweens.add({
      targets: this.boss,
      scaleX: 1.15,
      scaleY: 0.85,
      duration: 80,
      yoyo: true,
      onComplete: () => {
        if (this.boss.active) this.boss.clearTint();
      },
    });

    // Check Phase Transitions
    const thirdHp = Math.ceil(this.maxBossHealth / 3);
    if (this.bossHealth <= thirdHp && this.currentPhase === 2) {
      this.currentPhase = 3;
      this.isBossShielded = true;
      this.leversActivatedInPhase.clear();
      this.levers.getChildren().forEach((c) => (c as Phaser.Physics.Arcade.Sprite).clearTint());
      sounds.playBossPhase();
      this.cameras.main.flash(300, 239, 68, 68);
      this.showFloatingText(this.boss.x, this.boss.y - 70, '3. AŞAMA: MEGA GÜÇ! 🔥', '#ef4444');
    } else if (this.bossHealth <= thirdHp * 2 && this.currentPhase === 1) {
      this.currentPhase = 2;
      sounds.playBossPhase();
      this.cameras.main.flash(300, 245, 158, 11);
      this.showFloatingText(this.boss.x, this.boss.y - 70, '2. AŞAMA: ŞOK DALGALARI! ⚡', '#f59e0b');
    }

    this.broadcastHUD();

    if (this.bossHealth <= 0) {
      this.handleBossDefeated();
    }
  }

  private handleBossDefeated() {
    if (this.isCompleted) return;
    this.isCompleted = true;

    sounds.playBossDefeated();
    this.cameras.main.flash(600, 255, 255, 255);

    if (this.attackTimerEvent) this.attackTimerEvent.destroy();
    this.projectiles.clear(true, true);
    this.minions.clear(true, true);

    // Defeat explosion
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 1000,
      onComplete: () => {
        this.boss.destroy();
      },
    });

    this.time.delayedCall(1200, () => {
      EventBus.emit('level_completed', {
        levelId: this.levelData.id,
        stars: 3,
        coins: 50,
        time: this.battleTimer,
        isBossDefeated: true,
        bossType: this.levelData.bossType,
      });
    });
  }

  // --- DAMAGE TO PLAYER ---

  private handlePlayerBossCollision() {
    this.damagePlayer();
  }

  private handleProjectileHitPlayer(player: any, proj: any) {
    proj.destroy();
    this.damagePlayer();
  }

  private handleMinionHitPlayer(player: any, minion: any) {
    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    if (pBody.velocity.y > 50 && this.player.y < minion.y - 10) {
      sounds.playEnemyHit();
      minion.destroy();
      this.player.setVelocityY(-360);
      return;
    }
    this.damagePlayer();
  }

  private damagePlayer() {
    if (this.isInvincible) return;

    this.playerHealth--;
    sounds.playHurt();
    this.cameras.main.shake(180, 0.015);
    this.broadcastHUD();

    if (this.playerHealth <= 0) {
      this.handleGameOver();
      return;
    }

    this.isInvincible = true;
    this.player.setTint(0xf87171);
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 6,
      onComplete: () => {
        this.isInvincible = false;
        this.player.setAlpha(1);
        this.player.clearTint();
      },
    });
  }

  private handleGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    sounds.playGameOver();

    EventBus.emit('game_over', {
      levelId: this.levelData.id,
      reason: `${this.bossProfile.name} karşısında yenildin!`,
    });
  }

  private showFloatingText(x: number, y: number, text: string, color: string) {
    const txt = this.add.text(x, y, text, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color,
      stroke: '#020617',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 1600,
      onComplete: () => txt.destroy(),
    });
  }

  private broadcastHUD() {
    EventBus.emit('hud_update', {
      health: this.playerHealth,
      maxHealth: this.maxPlayerHealth,
      coins: 0,
      stars: 0,
      keys: 0,
      levelTime: this.battleTimer,
      levelTitle: this.levelData.title,
      worldNum: this.levelData.world,
      bossName: this.bossProfile.name,
      bossHp: this.bossHealth,
      maxBossHp: this.maxBossHealth,
      bossPhase: this.currentPhase,
      canShootEnergy: this.canShootEnergy,
      canDash: this.canDash,
    });
  }
}
