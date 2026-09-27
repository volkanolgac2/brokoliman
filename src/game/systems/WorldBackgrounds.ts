import Phaser from 'phaser';

/**
 * WorldBackgrounds – Generates clean, high-resolution, seamless multi-layer
 * parallax background textures for each world without any repeating text or thumbnail tiles.
 */
export class WorldBackgrounds {
  public static initWorldTextures(scene: Phaser.Scene) {
    // Generate each world's sky and parallax layers once in texture manager
    if (!scene.textures.exists('bg_sky_world_1')) {
      WorldBackgrounds.generateWorld1Textures(scene);
      WorldBackgrounds.generateWorld2Textures(scene);
      WorldBackgrounds.generateWorld3Textures(scene);
      WorldBackgrounds.generateWorld4Textures(scene);
      WorldBackgrounds.generateWorld5Textures(scene);
    }
  }

  // --- WORLD 1: YEŞİL VADİ ---
  private static generateWorld1Textures(scene: Phaser.Scene) {
    const W = 1920;
    const H = 720;

    // Sky & Clouds (Layer 0)
    const skyCanvas = scene.textures.createCanvas('bg_sky_world_1', W, H);
    if (skyCanvas) {
      const ctx = skyCanvas.context;
      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.5, '#7dd3fc');
      grad.addColorStop(1, '#dcfce7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Warm Sun
      const sunGrad = ctx.createRadialGradient(280, 140, 20, 280, 140, 120);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      sunGrad.addColorStop(0.4, 'rgba(253, 224, 71, 0.4)');
      sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(280, 140, 120, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy cartoon clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      const drawCloud = (cx: number, cy: number, s: number) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 32 * s, 0, Math.PI * 2);
        ctx.arc(cx + 35 * s, cy - 14 * s, 42 * s, 0, Math.PI * 2);
        ctx.arc(cx + 75 * s, cy, 34 * s, 0, Math.PI * 2);
        ctx.arc(cx + 38 * s, cy + 12 * s, 36 * s, 0, Math.PI * 2);
        ctx.fill();
      };

      drawCloud(120, 180, 1.2);
      drawCloud(580, 110, 0.9);
      drawCloud(980, 220, 1.4);
      drawCloud(1420, 130, 1.1);
      drawCloud(1780, 190, 1.3);

      skyCanvas.refresh();
    }

    // Far Mountains (Layer 1)
    const farCanvas = scene.textures.createCanvas('bg_far_world_1', W, H);
    if (farCanvas) {
      const ctx = farCanvas.context;
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, 380);

      // Smooth mountain sine waves
      for (let x = 0; x <= W; x += 40) {
        const y = 380 + Math.sin(x * 0.0035) * 80 + Math.cos(x * 0.007) * 45;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Mountain shading
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, 430);
      for (let x = 0; x <= W; x += 40) {
        const y = 430 + Math.sin((x + 200) * 0.004) * 60 + Math.cos(x * 0.009) * 35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      farCanvas.refresh();
    }

    // Midground Hills & Pine Trees (Layer 2)
    const midCanvas = scene.textures.createCanvas('bg_mid_world_1', W, H);
    if (midCanvas) {
      const ctx = midCanvas.context;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, 490);
      for (let x = 0; x <= W; x += 30) {
        const y = 490 + Math.sin(x * 0.006) * 45 + Math.cos(x * 0.012) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Stylized Cartoon Trees
      ctx.fillStyle = '#15803d';
      for (let x = 40; x < W; x += 110) {
        const baseY = 490 + Math.sin(x * 0.006) * 45 + Math.cos(x * 0.012) * 20;
        // Tree trunk
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x - 3, baseY - 35, 6, 35);
        // Tree foliage layers
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(x, baseY - 45, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x, baseY - 58, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      midCanvas.refresh();
    }
  }

  // --- WORLD 2: ÇİFTLİK BÖLGESİ ---
  private static generateWorld2Textures(scene: Phaser.Scene) {
    const W = 1920;
    const H = 720;

    const skyCanvas = scene.textures.createCanvas('bg_sky_world_2', W, H);
    if (skyCanvas) {
      const ctx = skyCanvas.context;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#fbbf24');
      grad.addColorStop(1, '#fef08a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Sunset Sun
      ctx.fillStyle = 'rgba(255, 241, 148, 0.9)';
      ctx.beginPath();
      ctx.arc(1400, 220, 80, 0, Math.PI * 2);
      ctx.fill();

      skyCanvas.refresh();
    }

    const farCanvas = scene.textures.createCanvas('bg_far_world_2', W, H);
    if (farCanvas) {
      const ctx = farCanvas.context;
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, 420);
      for (let x = 0; x <= W; x += 40) {
        const y = 420 + Math.sin(x * 0.004) * 60;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      farCanvas.refresh();
    }

    const midCanvas = scene.textures.createCanvas('bg_mid_world_2', W, H);
    if (midCanvas) {
      const ctx = midCanvas.context;
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, 500);
      for (let x = 0; x <= W; x += 30) {
        const y = 500 + Math.sin(x * 0.007) * 35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      midCanvas.refresh();
    }
  }

  // --- WORLD 3: SOS FABRİKASI ---
  private static generateWorld3Textures(scene: Phaser.Scene) {
    const W = 1920;
    const H = 720;

    const skyCanvas = scene.textures.createCanvas('bg_sky_world_3', W, H);
    if (skyCanvas) {
      const ctx = skyCanvas.context;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.6, '#4c1d95');
      grad.addColorStop(1, '#581c87');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      skyCanvas.refresh();
    }

    const farCanvas = scene.textures.createCanvas('bg_far_world_3', W, H);
    if (farCanvas) {
      const ctx = farCanvas.context;
      ctx.fillStyle = '#3b0764';
      for (let x = 0; x < W; x += 160) {
        const h = 180 + Math.sin(x) * 60;
        ctx.fillRect(x, H - h - 150, 90, h + 150);
        // Silo dome
        ctx.beginPath();
        ctx.arc(x + 45, H - h - 150, 45, Math.PI, 0);
        ctx.fill();
      }
      farCanvas.refresh();
    }

    const midCanvas = scene.textures.createCanvas('bg_mid_world_3', W, H);
    if (midCanvas) {
      const ctx = midCanvas.context;
      ctx.fillStyle = '#6b21a8';
      ctx.fillRect(0, 520, W, 200);
      // Factory Pipes
      ctx.fillStyle = '#9333ea';
      for (let x = 60; x < W; x += 220) {
        ctx.fillRect(x, 420, 24, 180);
      }
      midCanvas.refresh();
    }
  }

  // --- WORLD 4: BUZLUK BÖLGESİ ---
  private static generateWorld4Textures(scene: Phaser.Scene) {
    const W = 1920;
    const H = 720;

    const skyCanvas = scene.textures.createCanvas('bg_sky_world_4', W, H);
    if (skyCanvas) {
      const ctx = skyCanvas.context;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#082f49');
      grad.addColorStop(0.5, '#0284c7');
      grad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Aurora borealis wave
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, 220);
      for (let x = 0; x <= W; x += 50) {
        ctx.lineTo(x, 220 + Math.sin(x * 0.005) * 50);
      }
      ctx.lineTo(W, 360);
      ctx.lineTo(0, 360);
      ctx.closePath();
      ctx.fill();

      skyCanvas.refresh();
    }

    const farCanvas = scene.textures.createCanvas('bg_far_world_4', W, H);
    if (farCanvas) {
      const ctx = farCanvas.context;
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, 390);
      for (let x = 0; x <= W; x += 60) {
        const y = 390 + (x % 120 === 0 ? -90 : 30);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      farCanvas.refresh();
    }

    const midCanvas = scene.textures.createCanvas('bg_mid_world_4', W, H);
    if (midCanvas) {
      const ctx = midCanvas.context;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, 500);
      for (let x = 0; x <= W; x += 40) {
        ctx.lineTo(x, 500 + Math.sin(x * 0.01) * 30);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      midCanvas.refresh();
    }
  }

  // --- WORLD 5: HAMBURGER KALESİ ---
  private static generateWorld5Textures(scene: Phaser.Scene) {
    const W = 1920;
    const H = 720;

    const skyCanvas = scene.textures.createCanvas('bg_sky_world_5', W, H);
    if (skyCanvas) {
      const ctx = skyCanvas.context;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#450a0a');
      grad.addColorStop(0.5, '#7f1d1d');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      skyCanvas.refresh();
    }

    const farCanvas = scene.textures.createCanvas('bg_far_world_5', W, H);
    if (farCanvas) {
      const ctx = farCanvas.context;
      ctx.fillStyle = '#1e1b4b';
      // Castle battlements silhouette
      for (let x = 0; x < W; x += 180) {
        ctx.fillRect(x, 340, 110, 260);
        ctx.fillRect(x - 10, 300, 30, 60);
        ctx.fillRect(x + 90, 300, 30, 60);
      }
      farCanvas.refresh();
    }

    const midCanvas = scene.textures.createCanvas('bg_mid_world_5', W, H);
    if (midCanvas) {
      const ctx = midCanvas.context;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 520, W, 200);
      midCanvas.refresh();
    }
  }
}
