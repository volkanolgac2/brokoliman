import Phaser from 'phaser';
import { getLevelById, LevelDef, SCREEN_WIDTH } from './levelData';
import { EventBus } from './systems/EventBus';
import { sounds } from './systems/SoundManager';
import { WorldBackgrounds } from './systems/WorldBackgrounds';

export class LevelScene extends Phaser.Scene {
  private levelData!: LevelDef;
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms!: Phaser.Physics.Arcade.Group;
  private bridges!: Map<string, Phaser.Physics.Arcade.Sprite>;
  private coins!: Phaser.Physics.Arcade.StaticGroup;
  private starsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private keysGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  private crates!: Phaser.Physics.Arcade.Group;
  private destructibleCrates!: Phaser.Physics.Arcade.StaticGroup;
  private plates!: Phaser.Physics.Arcade.StaticGroup;
  private levers!: Phaser.Physics.Arcade.StaticGroup;
  private buttons!: Phaser.Physics.Arcade.StaticGroup;
  private doors!: Map<string, Phaser.Physics.Arcade.Sprite>;
  private exitPortal!: Phaser.Physics.Arcade.Sprite;
  private rescueCage?: Phaser.Physics.Arcade.Sprite;
  private rescuedBuddySprite?: Phaser.GameObjects.Sprite;
  private exitGlowFx?: Phaser.GameObjects.Graphics;
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;

  // Interaction prompt system
  private promptText?: Phaser.GameObjects.Text;
  private promptBackground?: Phaser.GameObjects.Graphics;
  private currentInteractable: { type: string; id: string; x: number; y: number; label: string; action: () => void } | null = null;

  // Player state
  private readonly PLAYER_BASE_SCALE = 64 / 512; // 0.125
  private health: number = 5;
  private maxHealth: number = 5;
  private collectedCoins: number = 0;
  private collectedStars: Set<string> = new Set();
  private collectedKeys: Set<string> = new Set();
  private activatedCheckpoints: Set<string> = new Set();
  private activatedLevers: Set<string> = new Set();
  private activatedPlates: Set<string> = new Set();
  private discoveredSecrets: Set<string> = new Set();
  private friendRescued: boolean = false;
  private currentCheckpoint = { x: 180, y: 550 };

  // Abilities & Cooldowns
  private isDashing: boolean = false;
  private canDash: boolean = true;
  private dashCooldownTimer: number = 0;
  private isAttacking: boolean = false;
  private canAttack: boolean = true;
  private isShootingEnergy: boolean = false;
  private canShootEnergy: boolean = true;
  private energyCooldownTimer: number = 0;
  private isInvincible: boolean = false;

  // Level & Flow
  private levelTimer: number = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private isCompleted: boolean = false;
  private isGameOver: boolean = false;
  private facingLeft: boolean = false;

  // Jump feel (Coyote time & Jump buffer)
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;

  // Input states
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
    super('LevelScene');
  }

  init(data: { levelId: number }) {
    this.levelData = getLevelById(data.levelId || 1);
    this.health = 5;
    this.maxHealth = 5;
    this.collectedCoins = 0;
    this.collectedStars.clear();
    this.collectedKeys.clear();
    this.activatedCheckpoints.clear();
    this.activatedLevers.clear();
    this.activatedPlates.clear();
    this.discoveredSecrets.clear();
    this.friendRescued = false;
    this.isDashing = false;
    this.canDash = true;
    this.isAttacking = false;
    this.canAttack = true;
    this.isShootingEnergy = false;
    this.canShootEnergy = true;
    this.isInvincible = false;
    this.levelTimer = 0;
    this.isCompleted = false;
    this.isGameOver = false;
    this.facingLeft = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.currentCheckpoint = { x: this.levelData.spawn.x, y: this.levelData.spawn.y };
    this.currentInteractable = null;
    this.bridges = new Map();
    this.doors = new Map();
    this.rescueCage = undefined;
    this.rescuedBuddySprite = undefined;
    this.exitGlowFx = undefined;
  }

  create() {
    const levelWidth = this.levelData.width;
    const height = 720;

    // Strict physics world bounds for horizontal multi-screen exploration
    this.physics.world.setBounds(0, 0, levelWidth, height + 100);

    // Start background music
    sounds.startBGM(this.levelData.world);

    // --- MULTI-LAYER PARALLAX BACKGROUND ---
    WorldBackgrounds.initWorldTextures(this);
    const wNum = this.levelData.world;
    this.bgSky = this.add.tileSprite(0, 0, 1280, 720, `bg_sky_world_${wNum}`).setOrigin(0, 0).setScrollFactor(0);
    this.bgFar = this.add.tileSprite(0, 0, 1280, 720, `bg_far_world_${wNum}`).setOrigin(0, 0).setScrollFactor(0);
    this.bgMid = this.add.tileSprite(0, 0, 1280, 720, `bg_mid_world_${wNum}`).setOrigin(0, 0).setScrollFactor(0);

    // --- PLATFORMS & BRIDGES ---
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });

    this.levelData.platforms.forEach((p) => {
      let pKey = 'zemin_1';
      if (p.type === 'hareketli') pKey = 'hareketli_platform';
      else if (p.type === 'asansor') pKey = 'asansor';
      else if (p.type) pKey = p.type;

      const pWidth = p.width || 192;
      const pHeight = p.height || 44;

      if (p.moving) {
        const plat = this.movingPlatforms.create(p.x, p.y, pKey) as Phaser.Physics.Arcade.Sprite;
        plat.setDisplaySize(pWidth, pHeight);
        const pBody = plat.body as Phaser.Physics.Arcade.Body;
        pBody.setSize(pWidth, pHeight);

        this.tweens.add({
          targets: plat,
          x: p.x + (p.moving.dx || 0),
          y: p.y + (p.moving.dy || 0),
          duration: 2500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      } else {
        const plat = this.platforms.create(p.x, p.y, pKey) as Phaser.Physics.Arcade.Sprite;
        plat.setDisplaySize(pWidth, pHeight);
        plat.refreshBody();

        if (p.isBridge && p.id) {
          this.bridges.set(p.id, plat);
          if (p.startsHidden) {
            plat.setVisible(false);
            (plat.body as Phaser.Physics.Arcade.Body).enable = false;
          }
        }
      }
    });

    // --- DOORS / GATES ---
    this.doors = new Map();
    this.levelData.doors.forEach((d) => {
      const door = this.physics.add.sprite(d.x, d.y, 'kilitli_kapi');
      door.setDisplaySize(54, 80);
      const dBody = door.body as Phaser.Physics.Arcade.Body;
      dBody.setAllowGravity(false);
      dBody.setImmovable(true);
      door.setTint(d.isLocked ? 0xef4444 : 0x22c55e);
      door.setData('def', d);
      this.doors.set(d.id, door);
    });

    // --- EXIT PORTAL (BÖLÜM FİNALİ) ---
    this.exitPortal = this.physics.add.sprite(this.levelData.exitPortal.x, this.levelData.exitPortal.y, 'kilitli_kapi');
    this.exitPortal.setDisplaySize(72, 92);
    const exitBody = this.exitPortal.body as Phaser.Physics.Arcade.Body;
    exitBody.setAllowGravity(false);
    exitBody.setImmovable(true);
    this.exitPortal.setTint(this.levelData.exitPortal.requiresRescue ? 0xf59e0b : 0x22c55e);

    this.exitGlowFx = this.add.graphics();

    // --- RESCUE CAGE & SEBZE DOST ---
    if (this.levelData.rescueCage) {
      const rc = this.levelData.rescueCage;
      this.rescueCage = this.physics.add.sprite(rc.x, rc.y, 'kafes');
      this.rescueCage.setDisplaySize(80, 92);
      this.rescueCage.setDepth(6);
      const cageBody = this.rescueCage.body as Phaser.Physics.Arcade.Body;
      cageBody.setAllowGravity(false);
      cageBody.setImmovable(true);

      let friendKey = rc.characterId;
      if (!this.textures.exists(friendKey)) {
        friendKey = rc.asset.split('/').pop()?.replace('.png', '') || 'domates';
      }
      if (!this.textures.exists(friendKey)) {
        friendKey = 'domates_dost';
      }

      this.rescuedBuddySprite = this.add.sprite(rc.x, rc.y + 2, friendKey);
      this.rescuedBuddySprite.setDisplaySize(54, 54);
      this.rescuedBuddySprite.setDepth(5);

      this.tweens.add({
        targets: this.rescuedBuddySprite,
        y: rc.y - 6,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // --- LEVERS (KALDIRAÇLAR) ---
    this.levers = this.physics.add.staticGroup();
    this.levelData.levers.forEach((l) => {
      const lev = this.levers.create(l.x, l.y, 'kaldirac') as Phaser.Physics.Arcade.Sprite;
      lev.setDisplaySize(44, 48);
      lev.refreshBody();
      lev.setData('def', l);
    });

    // --- BUTTONS (DÜĞMELER) ---
    this.buttons = this.physics.add.staticGroup();
    this.levelData.buttons.forEach((b) => {
      const btn = this.buttons.create(b.x, b.y, 'buton') as Phaser.Physics.Arcade.Sprite;
      btn.setDisplaySize(40, 28);
      btn.refreshBody();
      btn.setData('def', b);
    });

    // --- PRESSURE PLATES ---
    this.plates = this.physics.add.staticGroup();
    this.levelData.plates.forEach((pl) => {
      const plate = this.plates.create(pl.x, pl.y, 'kontrol_paneli') as Phaser.Physics.Arcade.Sprite;
      plate.setDisplaySize(54, 20);
      plate.refreshBody();
      plate.setData('def', pl);
    });

    // --- PUSHABLE PHYSICS CRATES & DESTRUCTIBLE CRATES ---
    this.crates = this.physics.add.group();
    this.destructibleCrates = this.physics.add.staticGroup();

    this.levelData.crates.forEach((c) => {
      if (c.isDestructible) {
        const dc = this.destructibleCrates.create(c.x, c.y, 'kirilabilir_kutu') as Phaser.Physics.Arcade.Sprite;
        dc.setDisplaySize(46, 46);
        dc.refreshBody();
        dc.setData('def', c);
      } else {
        const cr = this.crates.create(c.x, c.y, 'ahsap_kutu') as Phaser.Physics.Arcade.Sprite;
        cr.setDisplaySize(48, 48);
        const crBody = cr.body as Phaser.Physics.Arcade.Body;
        if (crBody) {
          crBody.setSize(44, 44);
          cr.setCollideWorldBounds(true);
          cr.setBounce(0.05);
          cr.setDragX(600);
          cr.setGravityY(800);
        }
      }
    });

    // --- CHECKPOINT FLAGS / BEACONS ---
    this.levelData.checkpoints.forEach((cp) => {
      const flag = this.add.sprite(cp.x, cp.y, 'yon_oku');
      flag.setDisplaySize(38, 44);
      flag.setTint(0x38bdf8);
      this.tweens.add({
        targets: flag,
        y: cp.y - 6,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // --- TUTORIAL SIGNS ---
    this.levelData.signs.forEach((s) => {
      const signSprite = this.add.sprite(s.x, s.y, 'kontrol_paneli');
      signSprite.setDisplaySize(40, 36);
      signSprite.setTint(0xfacc15);

      const label = this.add.text(s.x, s.y - 30, `ℹ️ ${s.title}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#fef08a',
        stroke: '#020617',
        strokeThickness: 3,
      }).setOrigin(0.5);

      this.tweens.add({
        targets: label,
        y: s.y - 34,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // --- HAZARDS (SPIKES) ---
    this.hazards = this.physics.add.staticGroup();
    this.levelData.hazards.forEach((h) => {
      const hz = this.hazards.create(h.x, h.y, h.type) as Phaser.Physics.Arcade.Sprite;
      hz.setDisplaySize(38, 38);
      hz.refreshBody();
    });

    // --- COINS ---
    this.coins = this.physics.add.staticGroup();
    this.levelData.coins.forEach((c) => {
      const coin = this.coins.create(c.x, c.y, 'altin_para') as Phaser.Physics.Arcade.Sprite;
      coin.setDisplaySize(30, 32);
      coin.refreshBody();
      this.tweens.add({
        targets: coin,
        y: c.y - 6,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // --- STARS ---
    this.starsGroup = this.physics.add.staticGroup();
    this.levelData.stars.forEach((s) => {
      const star = this.starsGroup.create(s.x, s.y, 'yildiz') as Phaser.Physics.Arcade.Sprite;
      star.setDisplaySize(38, 38);
      star.refreshBody();
      star.setData('id', s.id);
      this.tweens.add({
        targets: star,
        y: s.y - 8,
        scale: 1.1,
        duration: 750,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // --- KEYS ---
    this.keysGroup = this.physics.add.staticGroup();
    this.levelData.keys.forEach((k) => {
      const keyObj = this.keysGroup.create(k.x, k.y, 'anahtar') as Phaser.Physics.Arcade.Sprite;
      keyObj.setDisplaySize(34, 40);
      keyObj.refreshBody();
      keyObj.setData('id', k.id);
      this.tweens.add({
        targets: keyObj,
        y: k.y - 8,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // --- ENEMIES WITH HP ---
    this.enemies = this.physics.add.group();
    this.levelData.enemies.forEach((e) => {
      const en = this.enemies.create(e.x, e.y, e.type) as Phaser.Physics.Arcade.Sprite;
      en.setDisplaySize(48, 56);
      const enBody = en.body as Phaser.Physics.Arcade.Body;
      enBody.setSize(38, 46);
      en.setCollideWorldBounds(true);
      en.setGravityY(750);
      en.setBounce(1, 0);
      en.setVelocityX(e.speed || 60);
      en.setData('originX', e.x);
      en.setData('patrolDist', e.patrolDist || 90);
      en.setData('hp', e.hp || 2);
    });

    // --- PLAYER: BROKOLI HERO ---
    this.player = this.physics.add.sprite(this.levelData.spawn.x, this.levelData.spawn.y, 'brokoli_kahraman');
    this.player.setScale(this.PLAYER_BASE_SCALE);
    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    pBody.setSize(320, 420);
    pBody.setOffset(96, 60);
    pBody.setCollideWorldBounds(false);
    pBody.setBounce(0);
    this.player.setGravityY(920);

    // --- COLLISIONS ---
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.physics.add.collider(this.crates, this.platforms);
    this.physics.add.collider(this.crates, this.movingPlatforms);
    this.physics.add.collider(this.player, this.crates);
    this.physics.add.collider(this.enemies, this.platforms);
    this.doors.forEach((door) => {
      this.physics.add.collider(this.player, door, () => {
        const def = door.getData('def');
        if (def.isLocked) {
          this.showFloatingText(door.x, door.y - 50, def.label || 'Kilitli Kapı!', '#f87171');
        }
      });
    });

    // --- OVERLAPS ---
    this.physics.add.overlap(this.player, this.coins, this.handleCollectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.starsGroup, this.handleCollectStar, undefined, this);
    this.physics.add.overlap(this.player, this.keysGroup, this.handleCollectKey, undefined, this);
    this.physics.add.overlap(this.player, this.hazards, this.handleHazardHit, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, undefined, this);
    this.physics.add.overlap(this.crates, this.plates, this.handlePlateTrigger, undefined, this);
    this.physics.add.overlap(this.player, this.plates, this.handlePlateTrigger, undefined, this);
    this.physics.add.overlap(this.player, this.exitPortal, this.handleExitPortal, undefined, this);

    // --- FLOATING INTERACTION PROMPT UI ---
    this.promptBackground = this.add.graphics().setDepth(100);
    this.promptText = this.add.text(0, 0, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(101).setVisible(false);

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

    // Pointer click = melee attack
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.performMeleeAttack();
      }
    });

    // Camera follow with horizontal exploration deadzone
    this.cameras.main.setBounds(0, 0, levelWidth, height);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -100, 0);
    this.cameras.main.setDeadzone(140, 60);

    // Level Timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.isCompleted && !this.isGameOver) {
          this.levelTimer++;
          this.broadcastHUD();
        }
      },
      loop: true,
    });

    // Touch input from mobile
    EventBus.on('player_input', (input: typeof this.virtualInput) => {
      this.virtualInput = { ...this.virtualInput, ...input };
    });

    // Direct event triggers from mobile UI buttons
    EventBus.on('trigger_attack', () => this.performMeleeAttack());
    EventBus.on('trigger_energy', () => this.performEnergyProjectile());
    EventBus.on('trigger_interact', () => this.performInteract());
    EventBus.on('trigger_dash', () => this.performDash());
    EventBus.on('trigger_jump', () => this.performJump());

    this.broadcastHUD();
  }

  update(time: number, delta: number) {
    if (this.isCompleted || this.isGameOver) return;

    // Multi-layer Parallax background scroll
    if (this.bgSky) {
      this.bgSky.tilePositionX = this.cameras.main.scrollX * 0.05;
    }
    if (this.bgFar) {
      this.bgFar.tilePositionX = this.cameras.main.scrollX * 0.18;
    }
    if (this.bgMid) {
      this.bgMid.tilePositionX = this.cameras.main.scrollX * 0.38;
    }

    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = pBody.blocked.down || pBody.touching.down;

    if (onGround) {
      this.coyoteTimer = 140;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }

    // Cooldown timers
    if (this.energyCooldownTimer > 0) {
      this.energyCooldownTimer = Math.max(0, this.energyCooldownTimer - delta);
      if (this.energyCooldownTimer === 0) this.canShootEnergy = true;
    }
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer = Math.max(0, this.dashCooldownTimer - delta);
      if (this.dashCooldownTimer === 0) this.canDash = true;
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

    // --- HORIZONTAL MOVEMENT ---
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

    // --- JUMPING ---
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.player.setVelocityY(-540);
      sounds.playJump();

      // Jump stretch tween
      this.tweens.add({
        targets: this.player,
        scaleX: this.PLAYER_BASE_SCALE * 0.88,
        scaleY: this.PLAYER_BASE_SCALE * 1.18,
        duration: 90,
        yoyo: true,
      });

      // Jump dust puff
      const dust = this.add.circle(this.player.x, this.player.y + 24, 8, 0x4ade80, 0.6);
      this.tweens.add({
        targets: dust,
        scale: 2,
        alpha: 0,
        duration: 250,
        onComplete: () => dust.destroy(),
      });
    }

    // Variable jump height
    if (!jumpHolding && pBody.velocity.y < -160) {
      this.player.setVelocityY(-160);
    }

    // --- ACTION TRIGGERS ---
    if (doDash) this.performDash();
    if (doMelee) this.performMeleeAttack();
    if (doEnergy) this.performEnergyProjectile();
    if (doInteract) this.performInteract();

    // --- SQUASH & STRETCH ANIMATION ---
    const dirSign = this.facingLeft ? -1 : 1;
    const baseScaleX = this.PLAYER_BASE_SCALE * dirSign;
    const baseScaleY = this.PLAYER_BASE_SCALE;

    if (!onGround) {
      if (pBody.velocity.y < 0) {
        this.player.setScale(baseScaleX * 0.94, baseScaleY * 1.06);
      } else {
        this.player.setScale(baseScaleX * 1.06, baseScaleY * 0.94);
      }
    } else if (moveLeft || moveRight) {
      const bob = Math.sin(time * 0.016) * 0.05;
      this.player.setScale(baseScaleX * (1 + bob), baseScaleY * (1 - bob));
      this.player.setAngle(Math.sin(time * 0.016) * 3);
    } else {
      const breathe = Math.sin(time * 0.003) * 0.03;
      this.player.setScale(baseScaleX * (1 - breathe), baseScaleY * (1 + breathe));
      this.player.setAngle(0);
    }

    // --- ENEMY PATROL UPDATES ---
    this.enemies.getChildren().forEach((child) => {
      const en = child as Phaser.Physics.Arcade.Sprite;
      const originX = en.getData('originX') as number;
      const dist = en.getData('patrolDist') as number;
      const enBody = en.body as Phaser.Physics.Arcade.Body;

      if (enBody) {
        if (en.x > originX + dist) {
          en.setVelocityX(-Math.abs(enBody.velocity.x || 60));
          en.setFlipX(true);
        } else if (en.x < originX - dist) {
          en.setVelocityX(Math.abs(enBody.velocity.x || 60));
          en.setFlipX(false);
        }
      }
    });

    // --- CHECKPOINT DETECTION ---
    this.levelData.checkpoints.forEach((cp) => {
      if (!this.activatedCheckpoints.has(cp.id)) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, cp.x, cp.y);
        if (dist < 80) {
          this.activatedCheckpoints.add(cp.id);
          this.currentCheckpoint = { x: cp.x, y: cp.y };
          sounds.playCheckpoint();
          this.showFloatingText(cp.x, cp.y - 45, `🚩 ${cp.title} KAYDEDİLDİ!`, '#38bdf8');
        }
      }
    });

    // --- SECRET AREA DETECTION ---
    this.levelData.secretAreas.forEach((sec) => {
      if (!this.discoveredSecrets.has(sec.id)) {
        if (
          this.player.x >= sec.x &&
          this.player.x <= sec.x + sec.width &&
          this.player.y >= sec.y &&
          this.player.y <= sec.y + sec.height
        ) {
          this.discoveredSecrets.add(sec.id);
          sounds.playStar();
          this.showFloatingText(this.player.x, this.player.y - 70, sec.revealText, '#facc15');
        }
      }
    });

    // --- INTERACTION SCANNER (80-120px range) ---
    this.scanInteractables();

    // --- PIT FALL SAFETY CHECK ---
    if (this.player.y > 720) {
      this.handlePitFall();
    }

    // Left map boundary clamp
    if (this.player.x < 30) {
      this.player.setX(30);
      this.player.setVelocityX(0);
    }

    // Exit portal glow pulse
    if (this.exitGlowFx && this.exitPortal) {
      this.exitGlowFx.clear();
      const pulse = (Math.sin(time * 0.005) + 1) * 0.5;
      const canExit = !this.levelData.exitPortal.requiresRescue || this.friendRescued;
      if (canExit) {
        this.exitGlowFx.fillStyle(0x22c55e, 0.25 + pulse * 0.25);
        this.exitGlowFx.fillCircle(this.exitPortal.x, this.exitPortal.y, 48 + pulse * 14);
      } else {
        this.exitGlowFx.fillStyle(0xf59e0b, 0.18 + pulse * 0.15);
        this.exitGlowFx.fillCircle(this.exitPortal.x, this.exitPortal.y, 44 + pulse * 8);
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
    this.dashCooldownTimer = 750;
    sounds.playDash();

    const dir = this.facingLeft ? -1 : 1;
    this.player.setVelocityX(dir * 640);
    this.player.setTint(0x67e8f9);

    // Afterimage ghost effect
    const ghost = this.add.sprite(this.player.x, this.player.y, 'brokoli_kahraman');
    ghost.setScale(this.player.scaleX, this.player.scaleY);
    ghost.setTint(0x38bdf8);
    ghost.setAlpha(0.6);
    this.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: this.player.scaleX * 1.2,
      scaleY: this.player.scaleY * 1.2,
      duration: 200,
      onComplete: () => ghost.destroy(),
    });

    this.time.delayedCall(220, () => {
      this.isDashing = false;
      this.isInvincible = false;
      this.player.clearTint();
    });
  }

  public performMeleeAttack() {
    if (!this.canAttack || this.isAttacking) return;

    this.isAttacking = true;
    this.canAttack = false;
    sounds.playAttack();

    const dir = this.facingLeft ? -1 : 1;
    const slashX = this.player.x + dir * 45;
    const slashY = this.player.y;

    // Visual Slash Arc effect
    const slash = this.add.circle(slashX, slashY, 26, 0x4ade80, 0.85);
    this.tweens.add({
      targets: slash,
      scaleX: 2.2,
      scaleY: 0.8,
      alpha: 0,
      duration: 160,
      onComplete: () => slash.destroy(),
    });

    // Player punch squash
    this.tweens.add({
      targets: this.player,
      scaleX: this.PLAYER_BASE_SCALE * dir * 1.2,
      scaleY: this.PLAYER_BASE_SCALE * 0.85,
      duration: 80,
      yoyo: true,
    });

    // Melee Hitbox check against enemies
    this.enemies.getChildren().forEach((child) => {
      const en = child as Phaser.Physics.Arcade.Sprite;
      const dist = Phaser.Math.Distance.Between(slashX, slashY, en.x, en.y);
      if (dist < 60) {
        this.damageEnemy(en, 1);
      }
    });

    // Melee Hitbox check against destructible crates
    this.destructibleCrates.getChildren().forEach((child) => {
      const dc = child as Phaser.Physics.Arcade.Sprite;
      const dist = Phaser.Math.Distance.Between(slashX, slashY, dc.x, dc.y);
      if (dist < 60) {
        this.breakCrate(dc);
      }
    });

    // Melee Hitbox check against levers
    this.levers.getChildren().forEach((child) => {
      const lev = child as Phaser.Physics.Arcade.Sprite;
      const dist = Phaser.Math.Distance.Between(slashX, slashY, lev.x, lev.y);
      if (dist < 60) {
        this.activateLever(lev);
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
    this.energyCooldownTimer = 800;
    sounds.playEnergyShoot();

    const dir = this.facingLeft ? -1 : 1;
    const startX = this.player.x + dir * 35;
    const startY = this.player.y;

    // Glowing green energy orb
    const proj = this.physics.add.sprite(startX, startY, 'altin_para');
    proj.setDisplaySize(24, 24);
    proj.setTint(0x22c55e);
    const projBody = proj.body as Phaser.Physics.Arcade.Body;
    projBody.setAllowGravity(false);
    proj.setVelocityX(dir * 580);

    // Particle trail
    const trailTimer = this.time.addEvent({
      delay: 40,
      repeat: 12,
      callback: () => {
        if (proj.active) {
          const spark = this.add.circle(proj.x, proj.y, 5, 0x86efac, 0.8);
          this.tweens.add({
            targets: spark,
            scale: 0,
            alpha: 0,
            duration: 180,
            onComplete: () => spark.destroy(),
          });
        }
      },
    });

    // Collision with enemies
    this.physics.add.overlap(proj, this.enemies, (p: any, enemy: any) => {
      sounds.playEnergyHit();
      this.damageEnemy(enemy as Phaser.Physics.Arcade.Sprite, 1);
      this.spawnImpactBurst(proj.x, proj.y);
      trailTimer.destroy();
      proj.destroy();
    });

    // Collision with destructible crates
    this.physics.add.overlap(proj, this.destructibleCrates, (p: any, crate: any) => {
      sounds.playEnergyHit();
      this.breakCrate(crate as Phaser.Physics.Arcade.Sprite);
      this.spawnImpactBurst(proj.x, proj.y);
      trailTimer.destroy();
      proj.destroy();
    });

    // Maximum flight distance / timeout
    this.time.delayedCall(850, () => {
      if (proj.active) {
        this.spawnImpactBurst(proj.x, proj.y);
        trailTimer.destroy();
        proj.destroy();
      }
      this.isShootingEnergy = false;
    });
  }

  private spawnImpactBurst(x: number, y: number) {
    const burst = this.add.circle(x, y, 16, 0x4ade80, 0.9);
    this.tweens.add({
      targets: burst,
      scale: 2.5,
      alpha: 0,
      duration: 200,
      onComplete: () => burst.destroy(),
    });
  }

  // --- INTERACTION SYSTEM ([F] KEY) ---

  private scanInteractables() {
    let nearest: typeof this.currentInteractable = null;
    let minDist = 110;

    // Check Levers
    this.levers.getChildren().forEach((child) => {
      const lev = child as Phaser.Physics.Arcade.Sprite;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, lev.x, lev.y);
      if (dist < minDist) {
        minDist = dist;
        const def = lev.getData('def');
        nearest = {
          type: 'lever',
          id: def.id,
          x: lev.x,
          y: lev.y - 35,
          label: `[F] ${def.label || 'Kaldıracı Çek'}`,
          action: () => this.activateLever(lev),
        };
      }
    });

    // Check Buttons
    this.buttons.getChildren().forEach((child) => {
      const btn = child as Phaser.Physics.Arcade.Sprite;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, btn.x, btn.y);
      if (dist < minDist) {
        minDist = dist;
        const def = btn.getData('def');
        nearest = {
          type: 'button',
          id: def.id,
          x: btn.x,
          y: btn.y - 30,
          label: `[F] ${def.label || 'Düğmeye Bas'}`,
          action: () => this.activateButton(btn),
        };
      }
    });

    // Check Rescue Cage
    if (this.rescueCage && this.rescueCage.active && this.levelData.rescueCage && !this.friendRescued) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.rescueCage.x, this.rescueCage.y);
      if (dist < minDist) {
        minDist = dist;
        const rc = this.levelData.rescueCage;
        const hasKey = !rc.requiresKeyId || this.collectedKeys.has(rc.requiresKeyId);
        nearest = {
          type: 'rescue',
          id: rc.characterId,
          x: this.rescueCage.x,
          y: this.rescueCage.y - 45,
          label: hasKey ? `[F] ${rc.name}'ı Kurtar! 🔓` : `[F] Anahtar Gerekli! 🔑`,
          action: () => this.handleRescueInteraction(),
        };
      }
    }

    // Check Locked Doors
    this.doors.forEach((door) => {
      if (!door || !door.active) return;
      const def = door.getData('def');
      if (def && def.isLocked) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y);
        if (dist < minDist) {
          minDist = dist;
          nearest = {
            type: 'door',
            id: def.id,
            x: door.x,
            y: door.y - 45,
            label: `[F] ${def.label || 'Kapıyı İncele'}`,
            action: () => {
              if (def.requiresKeyId && this.collectedKeys.has(def.requiresKeyId)) {
                this.unlockDoor(door);
              } else {
                this.showFloatingText(door.x, door.y - 50, 'Bu kapı kilitli! 🔑', '#f87171');
              }
            },
          };
        }
      }
    });

    this.currentInteractable = nearest;

    // Render floating prompt
    if (nearest && this.promptText && this.promptBackground) {
      this.promptText.setText(nearest.label);
      this.promptText.setPosition(nearest.x, nearest.y);
      this.promptText.setVisible(true);

      const bounds = this.promptText.getBounds();
      this.promptBackground.clear();
      this.promptBackground.fillStyle(0x0f172a, 0.85);
      this.promptBackground.lineStyle(2, 0x4ade80, 0.9);
      this.promptBackground.fillRoundedRect(bounds.x - 8, bounds.y - 4, bounds.width + 16, bounds.height + 8, 8);
      this.promptBackground.strokeRoundedRect(bounds.x - 8, bounds.y - 4, bounds.width + 16, bounds.height + 8, 8);
      this.promptBackground.setVisible(true);
    } else {
      if (this.promptText) this.promptText.setVisible(false);
      if (this.promptBackground) this.promptBackground.setVisible(false);
    }
  }

  public performInteract() {
    if (this.currentInteractable) {
      this.currentInteractable.action();
    }
  }

  private activateLever(lev: Phaser.Physics.Arcade.Sprite) {
    const def = lev.getData('def');
    if (this.activatedLevers.has(def.id)) return;

    this.activatedLevers.add(def.id);
    lev.setFlipX(true);
    lev.setTint(0x22c55e);
    sounds.playLever();

    // Extend Target Bridge
    if (def.targetBridgeId && this.bridges.has(def.targetBridgeId)) {
      const bridge = this.bridges.get(def.targetBridgeId)!;
      bridge.setVisible(true);
      (bridge.body as Phaser.Physics.Arcade.Body).enable = true;
      sounds.playPuzzleSolved();
      this.showFloatingText(bridge.x, bridge.y - 30, 'KÖPRÜ AÇILDI! 🌉', '#22c55e');
    }

    // Unlock Target Door
    if (def.targetDoorId && this.doors.has(def.targetDoorId)) {
      const door = this.doors.get(def.targetDoorId)!;
      this.unlockDoor(door);
    }

    this.showFloatingText(lev.x, lev.y - 40, 'KALDIRAÇ ÇEKİLDİ! ⚙️', '#22c55e');
  }

  private activateButton(btn: Phaser.Physics.Arcade.Sprite) {
    const def = btn.getData('def');
    btn.setTint(0x22c55e);
    sounds.playButton();

    if (def.targetDoorId && this.doors.has(def.targetDoorId)) {
      const door = this.doors.get(def.targetDoorId)!;
      this.unlockDoor(door);
    }

    this.showFloatingText(btn.x, btn.y - 35, 'DÜĞME AKTİF! ✨', '#22c55e');
  }

  private handlePlateTrigger(obj1: any, plateObj: any) {
    const plate = plateObj as Phaser.Physics.Arcade.Sprite;
    const def = plate.getData('def');
    if (this.activatedPlates.has(def.id)) return;

    this.activatedPlates.add(def.id);
    plate.setTint(0x22c55e);
    sounds.playPuzzleSolved();

    if (def.targetDoorId && this.doors.has(def.targetDoorId)) {
      const door = this.doors.get(def.targetDoorId)!;
      this.unlockDoor(door);
    }

    this.showFloatingText(plate.x, plate.y - 30, 'AĞIRLIK PLAKASI KİLİTLENDİ! ⚖️', '#22c55e');
  }

  private unlockDoor(door: Phaser.Physics.Arcade.Sprite) {
    const def = door.getData('def');
    def.isLocked = false;
    door.setTint(0x22c55e);
    (door.body as Phaser.Physics.Arcade.Body).enable = false;
    sounds.playDoorOpen();

    this.tweens.add({
      targets: door,
      alpha: 0.3,
      y: door.y - 40,
      duration: 600,
    });

    this.showFloatingText(door.x, door.y - 50, 'GEÇİT AÇILDI! 🔓', '#4ade80');
  }

  private handleRescueInteraction() {
    if (!this.levelData.rescueCage || this.friendRescued) return;

    const rc = this.levelData.rescueCage;
    if (rc.requiresKeyId && !this.collectedKeys.has(rc.requiresKeyId)) {
      this.showFloatingText(this.rescueCage!.x, this.rescueCage!.y - 50, 'Kafes Anahtarı Gerekli! 🔑', '#f87171');
      return;
    }

    this.friendRescued = true;
    sounds.playRescue();

    if (this.rescueCage) {
      this.rescueCage.destroy();
    }

    if (this.rescuedBuddySprite) {
      this.rescuedBuddySprite.setDepth(20);
      this.tweens.add({
        targets: this.rescuedBuddySprite,
        y: this.rescuedBuddySprite.y - 65,
        scale: 1.4,
        duration: 900,
      });
    }

    // Emit rescue dialogue popup
    EventBus.emit('rescue_dialog', {
      name: rc.name,
      asset: rc.asset,
      text: rc.rescueText,
    });

    this.showFloatingText(this.player.x, this.player.y - 70, `${rc.name} KURTARILDI! 🎉`, '#facc15');

    // Portal is now ready!
    if (this.exitPortal) {
      this.exitPortal.setTint(0x22c55e);
    }

    this.broadcastHUD();
  }

  private damageEnemy(enemy: Phaser.Physics.Arcade.Sprite, damage: number) {
    let hp = (enemy.getData('hp') as number) - damage;
    enemy.setData('hp', hp);

    enemy.setTint(0xff0000);
    sounds.playEnemyHit();

    // Knockback
    const dir = enemy.x > this.player.x ? 1 : -1;
    enemy.setVelocity(dir * 180, -180);

    if (hp <= 0) {
      // Enemy defeated
      const pop = this.add.circle(enemy.x, enemy.y, 22, 0xfacc15, 0.9);
      this.tweens.add({
        targets: pop,
        scale: 2.2,
        alpha: 0,
        duration: 250,
        onComplete: () => pop.destroy(),
      });
      enemy.destroy();
    } else {
      this.time.delayedCall(160, () => {
        if (enemy.active) enemy.clearTint();
      });
    }
  }

  private breakCrate(crate: Phaser.Physics.Arcade.Sprite) {
    sounds.playCrateBreak();
    const cx = crate.x;
    const cy = crate.y;
    crate.destroy();

    // Wooden splinters particles
    for (let i = 0; i < 6; i++) {
      const splinter = this.add.rectangle(cx, cy, 8, 8, 0xb45309);
      this.tweens.add({
        targets: splinter,
        x: cx + Phaser.Math.Between(-40, 40),
        y: cy + Phaser.Math.Between(-40, 20),
        angle: Phaser.Math.Between(0, 360),
        alpha: 0,
        duration: 300,
        onComplete: () => splinter.destroy(),
      });
    }

    // Spawn bonus coin
    const bonusCoin = this.coins.create(cx, cy - 10, 'altin_para') as Phaser.Physics.Arcade.Sprite;
    bonusCoin.setDisplaySize(28, 30);
    bonusCoin.refreshBody();
    this.tweens.add({
      targets: bonusCoin,
      y: cy - 25,
      duration: 300,
      yoyo: true,
    });
  }

  // --- COLLECTIBLES ---

  private handleCollectCoin(player: any, coin: any) {
    coin.destroy();
    this.collectedCoins++;
    sounds.playCoin();

    const sparkle = this.add.circle(coin.x, coin.y, 8, 0xfde047, 0.9);
    this.tweens.add({
      targets: sparkle,
      scale: 2.2,
      alpha: 0,
      duration: 280,
      onComplete: () => sparkle.destroy(),
    });

    this.broadcastHUD();
  }

  private handleCollectStar(player: any, star: any) {
    const starId = star.getData('id') as string;
    this.collectedStars.add(starId);
    star.destroy();
    sounds.playStar();

    this.showFloatingText(player.x, player.y - 60, 'YILDIZ TOPLANDI! ⭐', '#facc15');
    this.broadcastHUD();
  }

  private handleCollectKey(player: any, keyObj: any) {
    const keyId = keyObj.getData('id') as string;
    this.collectedKeys.add(keyId);
    keyObj.destroy();
    sounds.playKey();

    this.showFloatingText(player.x, player.y - 60, 'ANAHTAR BULUNDU! 🔑', '#fde047');
    this.broadcastHUD();
  }

  // --- DAMAGE & HAZARDS ---

  private handleHazardHit() {
    if (this.isInvincible) return;

    this.health--;
    sounds.playHurt();
    this.cameras.main.shake(180, 0.015);
    this.broadcastHUD();

    if (this.health <= 0) {
      this.handlePlayerDeath();
      return;
    }

    this.isInvincible = true;
    this.player.setVelocityY(-360);
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

  private handleEnemyCollision(player: any, enemy: any) {
    const pBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Stomp enemy from above
    if (pBody.velocity.y > 60 && this.player.y < enemy.y - 15) {
      sounds.playStomp();
      this.damageEnemy(enemy as Phaser.Physics.Arcade.Sprite, 2);
      this.player.setVelocityY(-390);
      return;
    }

    this.handleHazardHit();
  }

  private handlePitFall() {
    // Immediately stop falling and place player back on the checkpoint platform
    this.player.setVelocity(0, 0);
    this.player.setPosition(this.currentCheckpoint.x, this.currentCheckpoint.y);

    if (this.isInvincible) return;

    this.health--;
    sounds.playHurt();
    this.broadcastHUD();

    if (this.health <= 0) {
      this.handlePlayerDeath();
      return;
    }

    // Respawn smoothly at last checkpoint
    this.isInvincible = true;
    this.player.setTint(0xf87171);

    this.tweens.add({
      targets: this.player,
      alpha: 0.4,
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

  private handlePlayerDeath() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    sounds.playGameOver();

    EventBus.emit('game_over', {
      levelId: this.levelData.id,
      reason: 'Canların tükendi!',
    });
  }

  // --- LEVEL COMPLETION ---

  private handleExitPortal() {
    if (this.levelData.exitPortal.requiresRescue && !this.friendRescued) {
      this.showFloatingText(this.exitPortal.x, this.exitPortal.y - 50, 'Önce Sebze Dostu Kurtarmalısın! 🥕', '#f59e0b');
      return;
    }

    if (this.isCompleted) return;
    this.isCompleted = true;

    sounds.playVictory();
    this.cameras.main.flash(500, 74, 222, 128);

    // Calculate 3 Stars
    let stars = 1; // Completed
    if (this.collectedCoins >= 15 || this.collectedStars.size >= 2) stars++;
    if (this.levelTimer <= this.levelData.targetTime || this.friendRescued) stars++;

    EventBus.emit('level_completed', {
      levelId: this.levelData.id,
      stars: Math.min(3, stars),
      coins: this.collectedCoins,
      time: this.levelTimer,
      friendRescued: this.friendRescued ? this.levelData.rescueCage : undefined,
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
      y: y - 45,
      alpha: 0,
      duration: 1500,
      onComplete: () => txt.destroy(),
    });
  }

  private broadcastHUD() {
    const levelWidth = this.levelData.width;
    const playerX = this.player ? this.player.x : this.levelData.spawn.x;
    const progress = Math.min(100, Math.max(0, Math.round((playerX / levelWidth) * 100)));
    const totalScreens = Math.ceil(levelWidth / SCREEN_WIDTH);
    const currentScreen = Math.min(totalScreens, Math.max(1, Math.floor(playerX / SCREEN_WIDTH) + 1));

    EventBus.emit('hud_update', {
      health: this.health,
      maxHealth: this.maxHealth,
      coins: this.collectedCoins,
      stars: this.collectedStars.size,
      keys: this.collectedKeys.size,
      levelTime: this.levelTimer,
      levelTitle: this.levelData.title,
      worldNum: this.levelData.world,
      progress,
      currentScreen,
      totalScreens,
      objectiveText: this.levelData.exitPortal.objectiveText,
      friendRescued: this.friendRescued,
      canShootEnergy: this.canShootEnergy,
      canDash: this.canDash,
    });
  }
}
