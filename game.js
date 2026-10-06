/**
 * Slime Studio 🧪✨
 * Dedicated ASMR Slime Making & Tactile Soft-Body Physics Simulator
 * Features:
 * - Click to squish with localized soft-body indentation & ripple waves
 * - Click & drag to stretch putty outward from exact grab points with elastic snap-back
 * - Hover stickiness: sticks to cursor and holds for duration based on stickiness level (1 to 5) before releasing with ASMR suction pop
 * - Textures: Cloud Slime (airy puffs, floaty mist), Floam Crunch (crunchy beads), Butter (creamy swirl), Glitter, Crystal, Gold
 * - Full Slime Maker studio with custom color mixing, stickiness tuning, charms, and Texture Shop economy
 */

(function () {
  'use strict';

  // --- Studio Constants ---
  const CANVAS_WIDTH = 960;
  const CANVAS_HEIGHT = 540;
  const NUM_VERTICES = 36;

  // Stickiness Durations for Hover Adhesion (in seconds)
  const STICKINESS_HOLD_TIMES = {
    1: 0.25, // Ultra Slick: barely sticks, releases almost immediately
    2: 0.70, // Light Gloss: light tackiness, releases promptly
    3: 1.50, // Balanced: gooey adhesion, holds for 1.5s
    4: 2.80, // Gooey Cushion: heavy adhesion, thick filaments, holds for 2.8s
    5: 4.50  // Super Sticky Taffy: extreme suction, long stretchy threads, holds for 4.5s
  };

  const STICKINESS_TRAITS = {
    1: { name: 'Level 1: Ultra Slick', hold: 0.25, desc: 'Ultra slick and springy non-stick putty. Sticks to cursor for only 0.25s, then slides off with a quick snap!' },
    2: { name: 'Level 2: Light Gloss', hold: 0.70, desc: 'Light gloss tackiness. Lightly adheres to cursor for 0.7s before releasing smoothly.' },
    3: { name: 'Level 3: Balanced', hold: 1.50, desc: 'Balanced jelly feel. Holds your cursor for 1.5s with gooey suction, then lets go with a satisfying pop!' },
    4: { name: 'Level 4: Gooey Cushion', hold: 2.80, desc: 'Thick gooey adhesion. Forms visible gooey filaments stretching to your cursor for 2.8s!' },
    5: { name: 'Level 5: Super Sticky Taffy', hold: 4.50, desc: 'Ultra sticky taffy! Stretches long gooey suction threads and holds tight for 4.5s before releasing!' }
  };

  // Textures Catalog
  const SLIME_TEXTURES = {
    classic: {
      id: 'classic',
      name: 'Classic Jelly',
      price: 0,
      icon: '🟢',
      tagline: 'Standard glossy bounce',
      desc: 'Translucent classic jelly slime. Balanced bounce and smooth cartoon sheen.'
    },
    cloud: {
      id: 'cloud',
      name: 'Cloud Slime ☁️',
      price: 150,
      icon: '☁️',
      tagline: 'Airy, drizzly & fluffy',
      desc: 'Fluffy drizzling cotton-candy texture! Fluffy cloud puffs and soft airy ASMR sounds.'
    },
    floam: {
      id: 'floam',
      name: 'Floam Crunch 🍡',
      price: 180,
      icon: '🍡',
      tagline: 'Crunchy micro-foam beads',
      desc: 'Packed with thousands of colorful crunchy foam beads that pop and crackle when squished!'
    },
    butter: {
      id: 'butter',
      name: 'Butter Slime 🧈',
      price: 220,
      icon: '🧈',
      tagline: 'Super smooth & spreadable',
      desc: 'Clay-infused velvety matte slime with a creamy butter-knife swirl texture.'
    },
    glitter: {
      id: 'glitter',
      name: 'Glitter Galaxy ✨',
      price: 250,
      icon: '✨',
      tagline: 'Dazzling star sparkles',
      desc: 'Infused with holographic stars that shimmer and leave sparkling cosmic trails.'
    },
    crystal: {
      id: 'crystal',
      name: 'Crystal Clear 💎',
      price: 300,
      icon: '💎',
      tagline: 'Pure glass refraction',
      desc: 'Ultra clear optical glass texture with brilliant light prism facets.'
    },
    gold: {
      id: 'gold',
      name: 'Golden Chrome 👑',
      price: 500,
      icon: '👑',
      tagline: 'Molten liquid 24K gold',
      desc: 'Pure royal metallic chrome reflection with luxury golden shimmer sparkles.'
    }
  };

  // Preset Colors for Palette
  const PRESET_COLORS = [
    { name: 'Sky Cyan', hex: '#80deea' },
    { name: 'Neon Lime', hex: '#70e000' },
    { name: 'Bubble Pink', hex: '#ff70a6' },
    { name: 'Sunshine Yellow', hex: '#ffd166' },
    { name: 'Sunburst Orange', hex: '#fb5607' },
    { name: 'Cosmic Lavender', hex: '#c77dff' },
    { name: 'Mint Frost', hex: '#52b788' },
    { name: 'Ruby Blaze', hex: '#ff0054' },
    { name: 'Pure Snow', hex: '#ffffff' },
    { name: 'Deep Midnight', hex: '#1e293b' }
  ];

  // Color Utility Helpers
  function hexToRgb(hex) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function adjustColor(hex, lum) {
    let { r, g, b } = hexToRgb(hex);
    r = Math.min(255, Math.max(0, Math.round(lum > 0 ? r + (255 - r) * lum : r * (1 + lum))));
    g = Math.min(255, Math.max(0, Math.round(lum > 0 ? g + (255 - g) * lum : g * (1 + lum))));
    b = Math.min(255, Math.max(0, Math.round(lum > 0 ? b + (255 - b) * lum : b * (1 + lum))));
    return `rgb(${r}, ${g}, ${b})`;
  }

  function generateSlimeGradient(baseHex) {
    return [
      adjustColor(baseHex, 0.65), // Highlight
      adjustColor(baseHex, 0.25), // Midtone
      baseHex,                    // Base
      adjustColor(baseHex, -0.45) // Shadow
    ];
  }

  // --- Visual Particle Classes ---
  class Particle {
    constructor(x, y, color, size = 5, vx = 0, vy = 0, life = 1.0, gravity = true) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.size = size;
      this.vx = vx || (Math.random() - 0.5) * 6;
      this.vy = vy || (Math.random() - 0.5) * 6 - 2;
      this.life = life;
      this.maxLife = life;
      this.hasGravity = gravity;
    }

    update(dt) {
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      if (this.hasGravity) this.vy += 0.35 * dt * 60;
      this.life -= dt;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      const alpha = Math.max(0, this.life / this.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Floating Coin FX
  class FloatingCoin {
    constructor(x, y, text = '+1 🪙') {
      this.x = x + (Math.random() - 0.5) * 20;
      this.y = y;
      this.text = text;
      this.life = 0.8;
      this.maxLife = 0.8;
    }

    update(dt) {
      this.y -= 45 * dt;
      this.life -= dt;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      const alpha = Math.max(0, this.life / this.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 20px "Lilita One", sans-serif';
      ctx.fillStyle = '#ffd166';
      ctx.strokeStyle = '#732600';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(this.text, this.x, this.y);
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    }
  }

  // Interactive Squishy Bubble
  class SlimeBubble {
    constructor(x, y, radius = 18, color = '#ffffff') {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.life = 12.0; // stays on slime until popped
      this.wobble = Math.random() * Math.PI * 2;
    }

    update(dt) {
      this.wobble += dt * 4;
      this.life -= dt;
    }

    isHit(x, y) {
      return Math.hypot(this.x - x, this.y - y) <= this.radius * 1.2;
    }

    draw(ctx) {
      ctx.save();
      const r = this.radius * (1 + Math.sin(this.wobble) * 0.05);

      // Translucent bubble body
      const grad = ctx.createRadialGradient(this.x - r * 0.3, this.y - r * 0.3, 2, this.x, this.y, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');

      ctx.fillStyle = grad;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(this.x - r * 0.35, this.y - r * 0.35, r * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // --- Soft-Body Interactive Slime Simulation ---
  class SlimeBlob {
    constructor(cx, cy, radius = 135) {
      this.cx = cx;
      this.cy = cy;
      this.baseRadius = radius;

      // Visual Recipe Configuration
      this.color = '#80deea';
      this.secondaryColor = '#ff80bf';
      this.hasDualSwirl = false;
      this.texture = 'cloud'; // default Cloud Slime
      this.stickiness = 3;     // 1 to 5
      this.charm = 'none';

      // 36 Boundary 2D Viscoelastic Soft-Body Vertices
      this.vertices = [];
      for (let i = 0; i < NUM_VERTICES; i++) {
        const angle = (i * Math.PI * 2) / NUM_VERTICES;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        this.vertices.push({
          index: i,
          angle: angle,
          restAngle: angle,
          x: x,
          y: y,
          vx: 0,
          vy: 0,
          restX: x,
          restY: y,
          pinned: false
        });
      }

      // 2D Viscous Drag & Tendril State
      this.isDragging = false;
      this.dragIndex = -1;
      this.dragX = cx;
      this.dragY = cy;
      this.dragPrevX = cx;
      this.dragPrevY = cy;
      this.dragSmoothX = cx;
      this.dragSmoothY = cy;
      this.tendrilCurvature = 0;
      this.stretchDistance = 0;

      // Hover Stickiness State
      this.isHoverStuck = false;
      this.hoverStickTimer = 0;
      this.hoverStickMax = STICKINESS_HOLD_TIMES[3];
      this.hoverStickX = cx;
      this.hoverStickY = cy;
      this.hoverCooldown = 0;
      this.hoverVertexIdx = -1;

      // Ambient Animation
      this.idlePhase = 0;
      this.globalWobble = 0;

      // Foam beads for Floam texture (36 beads moving with body)
      this.foamBeads = [];
      const beadColors = ['#ffffff', '#ff99c8', '#70e000', '#ffd166', '#00f5d4', '#ff70a6'];
      for (let i = 0; i < 36; i++) {
        const dist = Math.sqrt(Math.random()) * (radius * 0.85);
        const ang = Math.random() * Math.PI * 2;
        this.foamBeads.push({
          distRatio: dist / radius,
          ang: ang,
          size: 4 + Math.random() * 4,
          color: beadColors[Math.floor(Math.random() * beadColors.length)]
        });
      }

      // Glitter stars for Glitter texture
      this.glitterStars = [];
      for (let i = 0; i < 24; i++) {
        const dist = Math.sqrt(Math.random()) * (radius * 0.82);
        const ang = Math.random() * Math.PI * 2;
        this.glitterStars.push({
          distRatio: dist / radius,
          ang: ang,
          size: 5 + Math.random() * 4,
          phase: Math.random() * Math.PI * 2
        });
      }

      // Cloud puffs for Cloud texture
      this.cloudPuffs = [
        { ox: -40, oy: -35, r: 42 },
        { ox: 30, oy: -40, r: 44 },
        { ox: 0, oy: -15, r: 46 },
        { ox: -45, oy: 20, r: 38 },
        { ox: 38, oy: 25, r: 40 }
      ];

      // Topping charms
      this.charmItems = [];
      this.initCharms();
    }

    initCharms() {
      this.charmItems = [];
      if (this.charm === 'fruit') {
        const fruits = ['🍓', '🍉', '🥝', '🥑', '🍋'];
        for (let i = 0; i < 5; i++) {
          this.charmItems.push({
            emoji: fruits[i % fruits.length],
            x: this.cx + (Math.random() - 0.5) * 110,
            y: this.cy + (Math.random() - 0.5) * 80,
            rot: (Math.random() - 0.5) * 0.8
          });
        }
      } else if (this.charm === 'bear') {
        this.charmItems.push({ emoji: '🧸', x: this.cx, y: this.cy - 10, rot: 0 });
      } else if (this.charm === 'pearls') {
        for (let i = 0; i < 9; i++) {
          this.charmItems.push({
            emoji: '🔮',
            x: this.cx + (Math.random() - 0.5) * 120,
            y: this.cy + (Math.random() - 0.5) * 90,
            rot: 0
          });
        }
      }
    }

    applyRecipe({ color, secondaryColor, hasDualSwirl, texture, stickiness, charm }) {
      if (color) this.color = color;
      if (secondaryColor) this.secondaryColor = secondaryColor;
      if (hasDualSwirl !== undefined) this.hasDualSwirl = hasDualSwirl;
      if (texture) this.texture = texture;
      if (stickiness !== undefined) {
        this.stickiness = parseInt(stickiness, 10);
        this.hoverStickMax = STICKINESS_HOLD_TIMES[this.stickiness] || 1.5;
      }
      if (charm !== undefined) {
        this.charm = charm;
        this.initCharms();
      }
    }

    // Check if point (x, y) is inside or directly touching the slime boundary
    containsPoint(x, y) {
      // 1. Quick distance check for core resting body
      const dist = Math.hypot(x - this.cx, y - this.cy);
      if (dist <= this.baseRadius * 0.85) return true;

      // 2. Exact 2D Point-in-polygon ray casting check for arbitrary deformed body
      let inside = false;
      const n = this.vertices.length;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = this.vertices[i].x;
        const yi = this.vertices[i].y;
        const xj = this.vertices[j].x;
        const yj = this.vertices[j].y;
        const intersect = ((yi > y) !== (yj > y)) &&
          (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      if (inside) return true;

      // 3. Proximity padding around boundary vertices (generous grab hit area)
      for (let i = 0; i < n; i++) {
        const dx = this.vertices[i].x - x;
        const dy = this.vertices[i].y - y;
        if (dx * dx + dy * dy <= 24 * 24) return true;
      }
      return false;
    }

    // Find nearest vertex index to given (x, y) point in 2D space
    getNearestVertexIndex(x, y) {
      let closestIdx = 0;
      let minDistSq = Infinity;
      for (let i = 0; i < this.vertices.length; i++) {
        const dx = this.vertices[i].x - x;
        const dy = this.vertices[i].y - y;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDistSq) {
          minDistSq = distSq;
          closestIdx = i;
        }
      }
      return closestIdx;
    }

    // 💥 1. CLICK TO SQUISH: Apply localized indentation & ripple waves
    squish(x, y, force = 65) {
      const targetIdx = this.getNearestVertexIndex(x, y);

      // Direction from center to squish point
      const dx = x - this.cx;
      const dy = y - this.cy;
      const dist = Math.hypot(dx, dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;

      // Inward indentation impulse at clicked vertex
      const tv = this.vertices[targetIdx];
      tv.vx -= ux * force * 3.8;
      tv.vy -= uy * force * 3.8;

      // Ripples and lateral volume conservation bulges around the perimeter
      const n = this.vertices.length;
      for (let i = 1; i <= 7; i++) {
        const falloff = (8 - i) / 8;
        const leftIdx = (targetIdx - i + n) % n;
        const rightIdx = (targetIdx + i) % n;

        if (i <= 2) {
          // Inward dent for immediate neighbors
          this.vertices[leftIdx].vx -= ux * force * 2.2 * falloff;
          this.vertices[leftIdx].vy -= uy * force * 2.2 * falloff;
          this.vertices[rightIdx].vx -= ux * force * 2.2 * falloff;
          this.vertices[rightIdx].vy -= uy * force * 2.2 * falloff;
        } else {
          // Bulge outward further along the body for jelly incompressibility
          this.vertices[leftIdx].vx += ux * force * 1.5 * falloff;
          this.vertices[leftIdx].vy += uy * force * 1.5 * falloff;
          this.vertices[rightIdx].vx += ux * force * 1.5 * falloff;
          this.vertices[rightIdx].vy += uy * force * 1.5 * falloff;
        }
      }

      this.globalWobble = 0.55;
    }

    // ➰ 2. CLICK & DRAG TO STRETCH: 2D Viscous Putty Tendril that tracks mouse anywhere!
    startDrag(x, y) {
      this.isDragging = true;
      this.dragIndex = this.getNearestVertexIndex(x, y);
      this.dragX = x;
      this.dragY = y;
      this.dragSmoothX = x;
      this.dragSmoothY = y;
      this.dragPrevX = x;
      this.dragPrevY = y;
      this.tendrilCurvature = 0;
      this.stretchDistance = 0;
    }

    updateDrag(x, y) {
      if (!this.isDragging || this.dragIndex === -1) return;
      this.dragPrevX = this.dragX;
      this.dragPrevY = this.dragY;
      this.dragX = x;
      this.dragY = y;
    }

    endDrag() {
      if (!this.isDragging) return;
      this.isDragging = false;
      if (this.dragIndex !== -1) {
        const n = this.vertices.length;
        // Elastic rebound snap-back on all stretched tendril vertices!
        // Snap multiplier: slick putty snaps back very fast, gooey taffy has viscous retraction
        const snapMultiplier = 4.2 - (this.stickiness - 1) * 0.45;
        const K = 7;
        for (let d = 0; d <= K; d++) {
          const leftIdx = (this.dragIndex - d + n) % n;
          const rightIdx = (this.dragIndex + d) % n;
          const leftV = this.vertices[leftIdx];
          const rightV = this.vertices[rightIdx];

          const dispLX = leftV.x - leftV.restX;
          const dispLY = leftV.y - leftV.restY;
          leftV.vx -= dispLX * snapMultiplier;
          leftV.vy -= dispLY * snapMultiplier;
          leftV.pinned = false;

          if (d > 0) {
            const dispRX = rightV.x - rightV.restX;
            const dispRY = rightV.y - rightV.restY;
            rightV.vx -= dispRX * snapMultiplier;
            rightV.vy -= dispRY * snapMultiplier;
            rightV.pinned = false;
          }
        }
        this.globalWobble = 0.75;
      }
      this.dragIndex = -1;
      this.stretchDistance = 0;
    }

    // 🍯 3. HOVER STICKINESS: Adheres to cursor, holds for duration, then lets go!
    updateHover(mouseX, mouseY, dt, audioSystem) {
      // Manage cooldown timer
      if (this.hoverCooldown > 0) {
        this.hoverCooldown -= dt;
      }

      const isInside = this.containsPoint(mouseX, mouseY);

      // If hovering over slime, not currently dragging, and cooldown expired -> STICK!
      if (isInside && !this.isDragging && !this.isHoverStuck && this.hoverCooldown <= 0) {
        this.isHoverStuck = true;
        this.hoverStickMax = STICKINESS_HOLD_TIMES[this.stickiness] || 1.5;
        this.hoverStickTimer = this.hoverStickMax;
        this.hoverStickX = mouseX;
        this.hoverStickY = mouseY;
        this.hoverVertexIdx = this.getNearestVertexIndex(mouseX, mouseY);

        // Subtle initial adhesion sound
        if (audioSystem) {
          audioSystem.playASMRSquish(Math.max(1, this.stickiness - 1));
        }
      }

      // While hovering stuck
      if (this.isHoverStuck) {
        this.hoverStickTimer -= dt;
        this.hoverStickX = mouseX;
        this.hoverStickY = mouseY;

        // Pull the stuck surface slightly towards the cursor in 2D to create gooey suction peak
        if (this.hoverVertexIdx !== -1) {
          const n = this.vertices.length;
          const hv = this.vertices[this.hoverVertexIdx];
          hv.x += (mouseX - hv.x) * 0.16;
          hv.y += (mouseY - hv.y) * 0.16;

          const leftV = this.vertices[(this.hoverVertexIdx - 1 + n) % n];
          const rightV = this.vertices[(this.hoverVertexIdx + 1) % n];
          leftV.x += (mouseX - leftV.x) * 0.08;
          leftV.y += (mouseY - leftV.y) * 0.08;
          rightV.x += (mouseX - rightV.x) * 0.08;
          rightV.y += (mouseY - rightV.y) * 0.08;
        }

        // Check if stick timer expired OR mouse pulled too far away
        const currentDist = Math.hypot(mouseX - this.cx, mouseY - this.cy);
        const maxTearDist = this.baseRadius * (1.35 + this.stickiness * 0.15);

        if (this.hoverStickTimer <= 0 || currentDist > maxTearDist) {
          // 🔔 UNSTICK / LET GO!
          this.isHoverStuck = false;
          this.hoverCooldown = 0.45; // brief break before re-sticking

          if (this.hoverVertexIdx !== -1) {
            const hv = this.vertices[this.hoverVertexIdx];
            hv.vx -= (mouseX - hv.x) * 0.8;
            hv.vy -= (mouseY - hv.y) * 0.8;
          }

          // Satisfying suction release pop audio!
          if (audioSystem) {
            audioSystem.playStickRelease(this.stickiness);
          }

          return { unstick: true, x: mouseX, y: mouseY, stickiness: this.stickiness };
        }
      }

      return null;
    }

    // Soft-body Viscoelastic Spring Simulation Step
    updatePhysics(dt) {
      const n = this.vertices.length;
      this.idlePhase += dt * 3.2;

      // Base idle breathing oscillation
      const idleWobble = Math.sin(this.idlePhase) * 2.2;
      const currentRadius = this.baseRadius + idleWobble;

      // 1. Viscous drag tracking & tendril geometry update
      if (this.isDragging && this.dragIndex !== -1) {
        // Viscous lag: smooth tracking that follows the mouse with fluid inertia
        const viscousFollow = 0.42;
        this.dragSmoothX += (this.dragX - this.dragSmoothX) * viscousFollow;
        this.dragSmoothY += (this.dragY - this.dragSmoothY) * viscousFollow;

        // Transverse curvature / catenary lag
        const mdx = this.dragX - this.dragPrevX;
        const mdy = this.dragY - this.dragPrevY;
        const toCursorX = this.dragSmoothX - this.cx;
        const toCursorY = this.dragSmoothY - this.cy;
        const cursorDist = Math.hypot(toCursorX, toCursorY) || 1;
        const normCursorX = -toCursorY / cursorDist;
        const normCursorY = toCursorX / cursorDist;
        const lateralSpeed = mdx * normCursorX + mdy * normCursorY;
        this.tendrilCurvature += (lateralSpeed * 1.8 - this.tendrilCurvature) * 0.18;
        this.tendrilCurvature *= 0.94; // continuous damping

        const g = this.dragIndex;
        const K = 7; // 7 neighbors on each side = 15 tendril vertices

        // Left & right base anchors where the tendril roots into the main slime body
        const anchorLIdx = (g - K - 1 + n) % n;
        const anchorRIdx = (g + K + 1) % n;
        const anchorL = this.vertices[anchorLIdx];
        const anchorR = this.vertices[anchorRIdx];

        const baseMidX = (anchorL.x + anchorR.x) * 0.5;
        const baseMidY = (anchorL.y + anchorR.y) * 0.5;

        // Pull vector from base midpoint to mouse tip
        const pullX = this.dragSmoothX - baseMidX;
        const pullY = this.dragSmoothY - baseMidY;
        const pullLen = Math.hypot(pullX, pullY);
        this.stretchDistance = pullLen;

        // Tangent and normal along pull direction
        const pullTanX = pullLen > 0.001 ? pullX / pullLen : 1;
        const pullTanY = pullLen > 0.001 ? pullY / pullLen : 0;
        const pullNormX = -pullTanY;
        const pullNormY = pullTanX;

        // Base width between anchor points
        const baseDist = Math.hypot(anchorL.x - anchorR.x, anchorL.y - anchorR.y);
        const wBase = Math.min(65, Math.max(35, baseDist * 0.5));
        const wTip = 15;

        // Viscous necking factor (mass conservation: neck narrows as stretch grows)
        // High stickiness (level 5) can neck down thinner into gooey strands!
        const neckSensitivity = 55 + (5 - this.stickiness) * 10;
        const neckFactor = 1 / Math.sqrt(1 + Math.max(0, pullLen - 60) / neckSensitivity);

        // Position the tip vertex directly at smoothed cursor position
        const tipV = this.vertices[g];
        tipV.x = this.dragSmoothX;
        tipV.y = this.dragSmoothY;
        tipV.vx = (this.dragX - this.dragPrevX) * 20;
        tipV.vy = (this.dragY - this.dragPrevY) * 20;
        tipV.pinned = true;

        // Shape each pair of left/right vertices along the tendril spine
        for (let d = 1; d <= K; d++) {
          const t = 1 - d / (K + 1); // parameter from ~0 at base to ~1 at tip

          // Spine point connecting base midpoint to mouse tip
          let spineX = baseMidX + pullX * t;
          let spineY = baseMidY + pullY * t;

          // Quadratic transverse curvature offset
          const curveOffset = Math.sin(t * Math.PI) * this.tendrilCurvature;
          spineX += pullNormX * curveOffset;
          spineY += pullNormY * curveOffset;

          // Necking half-width at fraction t
          const wLinear = wBase * (1 - t) + wTip * t;
          const pinch = 4 * t * (1 - t) * (1 - neckFactor);
          const halfWidth = Math.max(6, wLinear * (1 - pinch));

          // Left and right target positions
          const targetLX = spineX + pullNormX * halfWidth;
          const targetLY = spineY + pullNormY * halfWidth;
          const targetRX = spineX - pullNormX * halfWidth;
          const targetRY = spineY - pullNormY * halfWidth;

          const leftIdx = (g - d + n) % n;
          const rightIdx = (g + d) % n;
          const leftV = this.vertices[leftIdx];
          const rightV = this.vertices[rightIdx];

          const pullRatio = 0.42 + t * 0.45;
          leftV.x += (targetLX - leftV.x) * pullRatio;
          leftV.y += (targetLY - leftV.y) * pullRatio;
          leftV.vx = (targetLX - leftV.x) * 15;
          leftV.vy = (targetLY - leftV.y) * 15;
          leftV.pinned = true;

          rightV.x += (targetRX - rightV.x) * pullRatio;
          rightV.y += (targetRY - rightV.y) * pullRatio;
          rightV.vx = (targetRX - rightV.x) * 15;
          rightV.vy = (targetRY - rightV.y) * 15;
          rightV.pinned = true;
        }

        // Unpin all vertices not in the tendril
        for (let i = 0; i < n; i++) {
          let distFromGrab = Math.abs(i - g);
          if (distFromGrab > n / 2) distFromGrab = n - distFromGrab;
          if (distFromGrab > K) {
            this.vertices[i].pinned = false;
          }
        }
      } else {
        for (let i = 0; i < n; i++) {
          this.vertices[i].pinned = false;
        }
      }

      // 2. Resting positions update
      // When stretched, the main body subtly contracts (volume conservation)
      let bodyContraction = 1.0;
      let bodyShiftX = 0;
      let bodyShiftY = 0;

      if (this.isDragging && this.stretchDistance > 40) {
        const pullX = this.dragSmoothX - this.cx;
        const pullY = this.dragSmoothY - this.cy;
        const pLen = Math.hypot(pullX, pullY) || 1;
        const maxShift = 28;
        const shiftAmt = Math.min(maxShift, (this.stretchDistance / 350) * maxShift);
        bodyShiftX = (pullX / pLen) * shiftAmt;
        bodyShiftY = (pullY / pLen) * shiftAmt;
        bodyContraction = Math.max(0.82, 1 - (this.stretchDistance / 600) * 0.18);
      }

      for (let i = 0; i < n; i++) {
        const v = this.vertices[i];
        const r = currentRadius * bodyContraction;
        v.restX = this.cx + bodyShiftX + Math.cos(v.restAngle) * r;
        v.restY = this.cy + bodyShiftY + Math.sin(v.restAngle) * r;
      }

      // 3. Multi-substep Spring-Damper Physics Integration
      const subSteps = 2;
      const subDt = Math.min(0.02, dt) / subSteps;
      const kRest = 85;
      const kNeighbor = 70;
      const cDamp = 5.2 + (this.stickiness - 1) * 1.8;

      for (let step = 0; step < subSteps; step++) {
        for (let i = 0; i < n; i++) {
          const v = this.vertices[i];
          if (v.pinned) continue; // Pinned vertices are guided by viscous tendril kinematics

          const prev = this.vertices[(i - 1 + n) % n];
          const next = this.vertices[(i + 1) % n];

          // Restoring spring to equilibrium shape
          const fRestX = -kRest * (v.x - v.restX);
          const fRestY = -kRest * (v.y - v.restY);

          // Surface tension / neighbor cohesion
          const avgNeighborX = (prev.x + next.x) * 0.5;
          const avgNeighborY = (prev.y + next.y) * 0.5;
          const fTensionX = kNeighbor * (avgNeighborX - v.x);
          const fTensionY = kNeighbor * (avgNeighborY - v.y);

          // Damping force
          const fDampX = -cDamp * v.vx;
          const fDampY = -cDamp * v.vy;

          // Integrate
          v.vx += (fRestX + fTensionX + fDampX) * subDt;
          v.vy += (fRestY + fTensionY + fDampY) * subDt;
          v.x += v.vx * subDt;
          v.y += v.vy * subDt;
        }
      }

      this.globalWobble *= 0.93;
    }

    // Reset Slime shape to resting equilibrium
    resetShape() {
      this.isDragging = false;
      this.dragIndex = -1;
      this.isHoverStuck = false;
      this.stretchDistance = 0;
      this.tendrilCurvature = 0;
      for (let i = 0; i < this.vertices.length; i++) {
        const v = this.vertices[i];
        v.x = this.cx + Math.cos(v.restAngle) * this.baseRadius;
        v.y = this.cy + Math.sin(v.restAngle) * this.baseRadius;
        v.vx = 0;
        v.vy = 0;
        v.pinned = false;
      }
      this.globalWobble = 0.4;
    }

    // Draw the Slime on Studio Canvas
    draw(ctx) {
      ctx.save();

      // 1. Soft Table Contact Shadows
      ctx.fillStyle = 'rgba(10, 20, 35, 0.45)';
      ctx.beginPath();
      ctx.ellipse(this.cx, this.cy + this.baseRadius * 0.72, this.baseRadius * 1.15, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic stretched shadow under the tendril
      if (this.isDragging && this.stretchDistance > 40) {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 20, 35, 0.22)';
        const tipShadowX = this.dragSmoothX;
        const tipShadowY = this.cy + this.baseRadius * 0.72 + (this.dragSmoothY - this.cy) * 0.2;
        ctx.beginPath();
        ctx.ellipse(tipShadowX, tipShadowY, 26, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy + this.baseRadius * 0.72);
        ctx.lineTo(tipShadowX, tipShadowY);
        ctx.lineWidth = 22;
        ctx.strokeStyle = 'rgba(10, 20, 35, 0.16)';
        ctx.stroke();
        ctx.restore();
      }

      // 2. Smooth Closed Spline Path through all 2D Vertices
      const n = this.vertices.length;
      ctx.beginPath();
      const midX0 = (this.vertices[0].x + this.vertices[n - 1].x) * 0.5;
      const midY0 = (this.vertices[0].y + this.vertices[n - 1].y) * 0.5;
      ctx.moveTo(midX0, midY0);

      for (let i = 0; i < n; i++) {
        const next = this.vertices[(i + 1) % n];
        const midX = (this.vertices[i].x + next.x) * 0.5;
        const midY = (this.vertices[i].y + next.y) * 0.5;
        ctx.quadraticCurveTo(this.vertices[i].x, this.vertices[i].y, midX, midY);
      }
      ctx.closePath();

      // 3. Rich Dynamic 3D Radial Gradient Jelly Fill
      let maxDist = this.baseRadius * 1.35;
      if (this.isDragging) {
        const dragDist = Math.hypot(this.dragSmoothX - this.cx, this.dragSmoothY - this.cy);
        maxDist = Math.max(maxDist, dragDist + 60);
      }
      const lightX = this.cx - this.baseRadius * 0.3;
      const lightY = this.cy - this.baseRadius * 0.35;
      const grad = ctx.createRadialGradient(lightX, lightY, 12, this.cx, this.cy, maxDist);

      if (this.texture === 'gold') {
        grad.addColorStop(0, '#fffbe0');
        grad.addColorStop(0.35, '#ffd700');
        grad.addColorStop(0.5, '#cca000');
        grad.addColorStop(0.52, '#fff3a8');
        grad.addColorStop(0.8, '#b8860b');
        grad.addColorStop(1, '#5c4308');
      } else if (this.texture === 'crystal') {
        grad.addColorStop(0, adjustColor(this.color, 0.75));
        grad.addColorStop(0.35, adjustColor(this.color, 0.35));
        grad.addColorStop(0.75, this.color);
        grad.addColorStop(1, adjustColor(this.color, -0.25));
      } else if (this.hasDualSwirl) {
        grad.addColorStop(0, adjustColor(this.color, 0.5));
        grad.addColorStop(0.45, this.color);
        grad.addColorStop(0.55, this.secondaryColor);
        grad.addColorStop(1, adjustColor(this.secondaryColor, -0.4));
      } else {
        const cGrad = generateSlimeGradient(this.color);
        grad.addColorStop(0, cGrad[0]);
        grad.addColorStop(0.3, cGrad[1]);
        grad.addColorStop(0.7, cGrad[2]);
        grad.addColorStop(1, cGrad[3]);
      }

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#1a2230';
      ctx.lineWidth = 3.5;
      ctx.fill();
      ctx.stroke();

      // 4. Texture-Specific Internal Detailing (Clipped to soft-body)
      ctx.save();
      ctx.clip();

      // Cloud Slime ☁️: Fluffy cumulus layered puffs
      if (this.texture === 'cloud') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        this.cloudPuffs.forEach(p => {
          ctx.beginPath();
          ctx.arc(this.cx + p.ox, this.cy + p.oy, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.cx - 15, this.cy - 10, 55, 0, Math.PI * 2);
        ctx.fill();

        // Wispy cloud puffs stretching through the tendril if dragging
        if (this.isDragging && this.stretchDistance > this.baseRadius * 0.9) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          const midPuffX = this.cx * 0.45 + this.dragSmoothX * 0.55;
          const midPuffY = this.cy * 0.45 + this.dragSmoothY * 0.55;
          ctx.beginPath();
          ctx.arc(midPuffX, midPuffY, 18, 0, Math.PI * 2);
          ctx.fill();

          const tipPuffX = this.cx * 0.2 + this.dragSmoothX * 0.8;
          const tipPuffY = this.cy * 0.2 + this.dragSmoothY * 0.8;
          ctx.beginPath();
          ctx.arc(tipPuffX, tipPuffY, 14, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Floam Crunch 🍡: Moving micro-foam beads with 3D sphere highlights
      else if (this.texture === 'floam') {
        const isPulling = this.isDragging && this.stretchDistance > 30;
        const pullDirX = isPulling ? (this.dragSmoothX - this.cx) / this.stretchDistance : 0;
        const pullDirY = isPulling ? (this.dragSmoothY - this.cy) / this.stretchDistance : 0;

        this.foamBeads.forEach(b => {
          let bx = this.cx + Math.cos(b.ang) * (this.baseRadius * b.distRatio);
          let by = this.cy + Math.sin(b.ang) * (this.baseRadius * b.distRatio);

          if (isPulling) {
            const beadDirX = Math.cos(b.ang);
            const beadDirY = Math.sin(b.ang);
            const alignDot = beadDirX * pullDirX + beadDirY * pullDirY;
            if (alignDot > 0.45) {
              const stretchInfluence = Math.pow(alignDot, 2) * (this.stretchDistance * 0.72) * b.distRatio;
              bx += pullDirX * stretchInfluence;
              by += pullDirY * stretchInfluence;
            }
          }

          ctx.fillStyle = b.color;
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(bx, by, b.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // 3D sphere shine
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(bx - b.size * 0.35, by - b.size * 0.35, b.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Butter Slime 🧈: Creamy butter-knife swirl curve across the body
      else if (this.texture === 'butter') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.cx - 75, this.cy - 20);
        ctx.bezierCurveTo(this.cx - 30, this.cy - 80, this.cx + 40, this.cy - 70, this.cx + 80, this.cy - 10);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(this.cx - 50, this.cy + 15);
        ctx.bezierCurveTo(this.cx - 10, this.cy - 25, this.cx + 35, this.cy - 20, this.cx + 60, this.cy + 25);
        ctx.stroke();

        // Extra swirl extending into stretched tendril if dragging
        if (this.isDragging && this.stretchDistance > this.baseRadius * 0.8) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(this.cx, this.cy);
          ctx.quadraticCurveTo(
            (this.cx + this.dragSmoothX) * 0.5 + 10,
            (this.cy + this.dragSmoothY) * 0.5 - 10,
            this.dragSmoothX,
            this.dragSmoothY
          );
          ctx.stroke();
        }
      }

      // Glitter Galaxy ✨: Holographic twinkling 4-point star sparkles
      else if (this.texture === 'glitter') {
        const isPulling = this.isDragging && this.stretchDistance > 30;
        const pullDirX = isPulling ? (this.dragSmoothX - this.cx) / this.stretchDistance : 0;
        const pullDirY = isPulling ? (this.dragSmoothY - this.cy) / this.stretchDistance : 0;

        this.glitterStars.forEach(s => {
          let sx = this.cx + Math.cos(s.ang) * (this.baseRadius * s.distRatio);
          let sy = this.cy + Math.sin(s.ang) * (this.baseRadius * s.distRatio);

          if (isPulling) {
            const alignDot = Math.cos(s.ang) * pullDirX + Math.sin(s.ang) * pullDirY;
            if (alignDot > 0.4) {
              const stretchInfluence = Math.pow(alignDot, 2) * (this.stretchDistance * 0.7) * s.distRatio;
              sx += pullDirX * stretchInfluence;
              sy += pullDirY * stretchInfluence;
            }
          }

          const pulse = (Math.sin(this.idlePhase * 2 + s.phase) + 1) * 0.5;
          const sz = s.size * (0.6 + pulse * 0.6);

          ctx.fillStyle = pulse > 0.6 ? '#ffffff' : '#fff3a8';
          ctx.beginPath();
          ctx.moveTo(sx, sy - sz);
          ctx.quadraticCurveTo(sx, sy, sx + sz, sy);
          ctx.quadraticCurveTo(sx, sy, sx, sy + sz);
          ctx.quadraticCurveTo(sx, sy, sx - sz, sy);
          ctx.quadraticCurveTo(sx, sy, sx, sy - sz);
          ctx.fill();
        });
      }

      // Crystal Clear 💎: Optical prism facet lines
      else if (this.texture === 'crystal') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(this.cx - 60, this.cy - 10);
        ctx.lineTo(this.cx - 20, this.cy - 70);
        ctx.lineTo(this.cx + 30, this.cy - 70);
        ctx.lineTo(this.cx + 70, this.cy - 10);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.fill();

        // Prism refraction facet along stretch
        if (this.isDragging && this.stretchDistance > 40) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(this.cx, this.cy);
          ctx.lineTo(this.dragSmoothX, this.dragSmoothY);
          ctx.stroke();
        }
      }

      // Golden Chrome 👑: Metallic horizon reflection line
      else if (this.texture === 'gold') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.baseRadius * 0.55, Math.PI * 1.1, Math.PI * 1.5);
        ctx.stroke();

        // Molten chrome streak into stretched neck
        if (this.isDragging && this.stretchDistance > 40) {
          ctx.strokeStyle = '#fffbe0';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(this.cx, this.cy);
          ctx.lineTo(this.dragSmoothX, this.dragSmoothY);
          ctx.stroke();
        }
      }

      // Topping Charms
      if (this.charmItems.length > 0) {
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        this.charmItems.forEach(ch => {
          ctx.save();
          ctx.translate(ch.x, ch.y);
          ctx.rotate(ch.rot);
          ctx.fillText(ch.emoji, 0, 0);
          ctx.restore();
        });
      }

      ctx.restore(); // End clipping

      // 5. Gooey Strands / Filaments (Viscous taffy threads inside the stretch for stickiness >= 3)
      if (this.isDragging && this.stretchDistance > this.baseRadius * 1.05) {
        ctx.save();
        const strandCount = this.stickiness >= 4 ? 3 : 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = this.stickiness >= 4 ? 2.0 : 1.2;
        for (let s = 0; s < strandCount; s++) {
          const offset = (s - (strandCount - 1) / 2) * 8;
          ctx.beginPath();
          ctx.moveTo(this.cx + offset, this.cy + offset);
          ctx.quadraticCurveTo(
            (this.cx + this.dragSmoothX) * 0.5 + offset * 1.8,
            (this.cy + this.dragSmoothY) * 0.5 + 8,
            this.dragSmoothX + offset * 0.3,
            this.dragSmoothY + offset * 0.3
          );
          ctx.stroke();
        }
        ctx.restore();
      }

      // 6. Specular Gloss Shines (Cartoon jelly sheen)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 7.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.baseRadius * 0.78, Math.PI * 1.15, Math.PI * 1.42);
      ctx.stroke();

      // Secondary specular dot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(this.cx - this.baseRadius * 0.55, this.cy - this.baseRadius * 0.52, 6, 0, Math.PI * 2);
      ctx.fill();

      // 7. Tip Pinch Specular Highlight (The grab point where user is holding the slime!)
      if (this.isDragging) {
        const tipX = this.dragSmoothX;
        const tipY = this.dragSmoothY;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.beginPath();
        ctx.arc(tipX - 3, tipY - 3, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(tipX + 3.5, tipY + 3, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 8. Draw Hover Stickiness Goo Filaments & Indicator
      if (this.isHoverStuck) {
        ctx.save();
        const filaments = 4;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.stickiness >= 4 ? 3.5 : 2.0;

        for (let f = 0; f < filaments; f++) {
          const spread = (f - filaments / 2) * 8;
          ctx.beginPath();
          ctx.moveTo(this.hoverStickX + spread, this.hoverStickY + spread);
          ctx.quadraticCurveTo(
            (this.hoverStickX + this.cx) / 2 + spread * 2,
            (this.hoverStickY + this.cy) / 2,
            this.cx + spread,
            this.cy
          );
          ctx.stroke();
        }

        // Circular Countdown Ring around cursor showing remaining stickiness hold time!
        const timerProgress = Math.max(0, this.hoverStickTimer / this.hoverStickMax);
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(this.hoverStickX, this.hoverStickY, 20, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * timerProgress));
        ctx.stroke();

        // Inner glowing tackiness dot
        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.arc(this.hoverStickX, this.hoverStickY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
    }
  }

  // --- Main Slime Studio Game Controller ---
  class SlimeStudio {
    constructor() {
      this.canvas = document.getElementById('slimeCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.canvasStage = document.getElementById('canvasStage');
      this.canvasWrapper = document.getElementById('canvasWrapper');

      // Slime Entity
      this.slime = new SlimeBlob(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 135);

      // Studio Economy & Data
      this.coins = parseInt(localStorage.getItem('slime_coins') || '250', 10);
      try {
        this.unlockedTextures = JSON.parse(localStorage.getItem('slime_unlocked_textures') || '["classic", "cloud"]');
      } catch (e) {
        this.unlockedTextures = ['classic', 'cloud'];
      }

      // Stats
      this.statSquishes = 0;
      this.statStretches = 0;

      // Active Tool Mode ('poke', 'swirl', 'glitter', 'bubble')
      this.activeTool = 'poke';

      // Visual Effects Collections
      this.particles = [];
      this.floatingCoins = [];
      this.bubbles = [];

      // Mouse State
      this.mouse = { x: 0, y: 0, isDown: false };

      // DOM Elements
      this.bindDOMElements();
      this.bindEventListeners();
      this.initStudio();

      // Screen Warper
      this.warpGameToScreen();
      window.addEventListener('resize', () => this.warpGameToScreen());
      window.addEventListener('orientationchange', () => setTimeout(() => this.warpGameToScreen(), 120));
      if (window.ResizeObserver && this.canvasStage) {
        new ResizeObserver(() => this.warpGameToScreen()).observe(this.canvasStage);
      }

      // Animation Loop
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    bindDOMElements() {
      this.coinsVal = document.getElementById('coinsVal');
      this.coinsBadge = document.getElementById('coinsBadge');
      this.activeSlimeIcon = document.getElementById('activeSlimeIcon');
      this.activeSlimeName = document.getElementById('activeSlimeName');
      this.activeStickinessTag = document.getElementById('activeStickinessTag');
      this.hudStickinessLabel = document.getElementById('hudStickinessLabel');
      this.hudActionFeedback = document.getElementById('hudActionFeedback');
      this.statSquishesEl = document.getElementById('statSquishes');
      this.statStretchesEl = document.getElementById('statStretches');
      this.soundToggleBtn = document.getElementById('soundToggle');
      this.resetShapeBtn = document.getElementById('resetShapeBtn');

      // Modals
      this.openMakerBtn = document.getElementById('openMakerBtn');
      this.openShopBtn = document.getElementById('openShopBtn');
      this.slimeMakerModal = document.getElementById('slimeMakerModal');
      this.closeMakerBtn = document.getElementById('closeMakerBtn');
      this.closeMakerXBtn = document.getElementById('closeMakerXBtn');
      this.textureShopModal = document.getElementById('textureShopModal');
      this.closeShopBtn = document.getElementById('closeShopBtn');
      this.closeShopXBtn = document.getElementById('closeShopXBtn');
      this.shopCoinsVal = document.getElementById('shopCoinsVal');
      this.labCoinsVal = document.getElementById('labCoinsVal');

      // Slime Maker Recipe Form Elements
      this.makerTextureSelectRow = document.getElementById('makerTextureSelectRow');
      this.colorPalette = document.getElementById('colorPalette');
      this.customColorPicker = document.getElementById('customColorPicker');
      this.customColorPicker2 = document.getElementById('customColorPicker2');
      this.dualSwirlToggle = document.getElementById('dualSwirlToggle');
      this.stickinessSlider = document.getElementById('stickinessSlider');
      this.stickinessValueLabel = document.getElementById('stickinessValueLabel');
      this.stickinessTraitDesc = document.getElementById('stickinessTraitDesc');
      this.stickinessPreviewTag = document.getElementById('stickinessPreviewTag');
      this.activeTextureLabel = document.getElementById('activeTextureLabel');
      this.slimePreviewCanvas = document.getElementById('slimePreviewCanvas');
      this.createSlimeBtn = document.getElementById('createSlimeBtn');
      this.charmsPickerRow = document.getElementById('charmsPickerRow');

      // Shop
      this.texturesGrid = document.getElementById('texturesGrid');

      // Floating Toolbar Elements
      this.quickColorsRow = document.getElementById('quickColorsRow');
      this.quickStickButtons = document.querySelectorAll('.quick-stick-btn');
      this.toolBtns = {
        poke: document.getElementById('toolPokeBtn'),
        swirl: document.getElementById('toolSwirlBtn'),
        glitter: document.getElementById('toolGlitterBtn'),
        bubble: document.getElementById('toolBubbleBtn')
      };
    }

    bindEventListeners() {
      // Audio unlock on user touch/click
      ['click', 'touchstart', 'mousedown'].forEach(evt => {
        window.addEventListener(evt, () => {
          if (window.slimeAudio) window.slimeAudio.init();
        }, { once: true, passive: true });
      });

      // Canvas Pointer Coordinate Mapping
      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
        };
      };

      // 💥 Canvas Mouse Down: Click to Squish or Start Drag Stretch
      this.canvas.addEventListener('mousedown', (e) => {
        const pos = getPos(e);
        this.handlePointerDown(pos.x, pos.y);
      });

      // ➰ Canvas Mouse Move: Drag Stretch or Hover Stickiness Tracking
      window.addEventListener('mousemove', (e) => {
        const pos = getPos(e);
        this.handlePointerMove(pos.x, pos.y);
      });

      // Canvas Mouse Up: Release Drag Stretch
      window.addEventListener('mouseup', () => {
        this.handlePointerUp();
      });

      // Mobile Touch Handlers
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const pos = getPos(e);
        this.handlePointerDown(pos.x, pos.y);
      }, { passive: false });

      this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const pos = getPos(e);
        this.handlePointerMove(pos.x, pos.y);
      }, { passive: false });

      this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handlePointerUp();
      }, { passive: false });

      // Keyboard Shortcuts (1-5 change stickiness, R resets shape, M mutes sound)
      window.addEventListener('keydown', (e) => {
        if (['1', '2', '3', '4', '5'].includes(e.key)) {
          this.setStickiness(parseInt(e.key, 10));
        } else if (e.key.toLowerCase() === 'r') {
          this.resetShape();
        } else if (e.key.toLowerCase() === 'm') {
          this.toggleSound();
        } else if (e.key === 'Escape') {
          this.closeMaker();
          this.closeShop();
        }
      });

      // Header Buttons
      if (this.soundToggleBtn) {
        this.soundToggleBtn.addEventListener('click', () => this.toggleSound());
      }
      if (this.resetShapeBtn) {
        this.resetShapeBtn.addEventListener('click', () => this.resetShape());
      }
      if (this.openMakerBtn) {
        this.openMakerBtn.addEventListener('click', () => this.openMaker());
      }
      if (this.closeMakerBtn) {
        this.closeMakerBtn.addEventListener('click', () => this.closeMaker());
      }
      if (this.closeMakerXBtn) {
        this.closeMakerXBtn.addEventListener('click', () => this.closeMaker());
      }
      if (this.openShopBtn) {
        this.openShopBtn.addEventListener('click', () => this.openShop());
      }
      if (this.closeShopBtn) {
        this.closeShopBtn.addEventListener('click', () => this.closeShop());
      }
      if (this.closeShopXBtn) {
        this.closeShopXBtn.addEventListener('click', () => this.closeShop());
      }

      // Modals Backdrop Click
      if (this.slimeMakerModal) {
        this.slimeMakerModal.addEventListener('click', (e) => {
          if (e.target === this.slimeMakerModal) this.closeMaker();
        });
      }
      if (this.textureShopModal) {
        this.textureShopModal.addEventListener('click', (e) => {
          if (e.target === this.textureShopModal) this.closeShop();
        });
      }

      // Quick Stickiness Buttons (1 to 5)
      this.quickStickButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const lvl = parseInt(btn.getAttribute('data-level'), 10);
          this.setStickiness(lvl);
        });
      });

      // Tool Mode Buttons
      Object.keys(this.toolBtns).forEach(mode => {
        const btn = this.toolBtns[mode];
        if (btn) {
          btn.addEventListener('click', () => {
            this.setToolMode(mode);
          });
        }
      });
    }

    // Pointer Interaction Handlers
    handlePointerDown(x, y) {
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.isDown = true;

      // Check if user clicked a bubble
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        if (this.bubbles[i].isHit(x, y)) {
          this.popBubble(i);
          return;
        }
      }

      // Check if inside or near slime
      if (this.slime.containsPoint(x, y)) {
        if (this.activeTool === 'poke') {
          // 💥 Squish immediately on click
          this.slime.squish(x, y, 65);
          this.statSquishes++;
          this.updateStats();

          // Audio: ASMR squish
          if (window.slimeAudio) {
            if (this.slime.texture === 'cloud') {
              window.slimeAudio.playCloudPuff();
            } else if (this.slime.texture === 'floam') {
              window.slimeAudio.playFoamCrunch();
            } else {
              window.slimeAudio.playASMRSquish(this.slime.stickiness);
            }
          }

          // Particles splash
          this.spawnSquishParticles(x, y);

          // Rewarded with coin!
          this.addCoins(1, x, y);

          // Also begin drag stretch so holding & moving stretches putty outward
          this.slime.startDrag(x, y);
        } else if (this.activeTool === 'swirl') {
          // Swirl Knead
          this.slime.squish(x, y, 40);
          this.statSquishes++;
          this.updateStats();
          if (window.slimeAudio) window.slimeAudio.playASMRSquish(this.slime.stickiness);
        } else if (this.activeTool === 'glitter') {
          // Glitter Dust
          this.spawnGlitterDust(x, y);
          this.addCoins(1, x, y);
        } else if (this.activeTool === 'bubble') {
          // Blow a new bubble on slime
          this.bubbles.push(new SlimeBubble(x, y, 16 + Math.random() * 14, this.slime.color));
          if (window.slimeAudio) window.slimeAudio.playASMRSquish(2);
        }
      }
    }

    handlePointerMove(x, y) {
      this.mouse.x = x;
      this.mouse.y = y;

      if (this.mouse.isDown && this.slime.isDragging) {
        // ➰ Dragging stretches putty outward!
        this.slime.updateDrag(x, y);
        if (window.slimeAudio && Math.random() < 0.15) {
          window.slimeAudio.playStretch(1.0);
        }
      } else {
        // 🖐️ Hovering without clicking: Soft-Body Hover Adhesion
        // Updates hover stickiness and triggers unstick release pop if timer expires
        const unstickEvent = this.slime.updateHover(x, y, 0.016, window.slimeAudio);
        if (unstickEvent) {
          this.spawnUnstickParticles(unstickEvent.x, unstickEvent.y);
          this.addCoins(2, unstickEvent.x, unstickEvent.y, '+2 🪙');
          if (this.hudActionFeedback) {
            this.hudActionFeedback.textContent = `🍯 Unstuck! (Level ${unstickEvent.stickiness} release pop)`;
            setTimeout(() => {
              if (this.hudActionFeedback) this.hudActionFeedback.textContent = '🖐️ Hover to stick · Click to squish · Drag to stretch!';
            }, 1200);
          }
        }
      }
    }

    handlePointerUp() {
      if (this.mouse.isDown) {
        this.mouse.isDown = false;
        if (this.slime.isDragging) {
          // Snap back putty stretch!
          this.slime.endDrag();
          this.statStretches++;
          this.updateStats();
          this.addCoins(3, this.mouse.x, this.mouse.y, '+3 🪙');

          if (window.slimeAudio) {
            window.slimeAudio.playStickRelease(this.slime.stickiness);
          }
        }
      }
    }

    popBubble(idx) {
      const b = this.bubbles[idx];
      this.bubbles.splice(idx, 1);

      // Bubble pop particles
      for (let i = 0; i < 10; i++) {
        this.particles.push(new Particle(b.x, b.y, 'rgba(255, 255, 255, 0.9)', 3, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 0.5, true));
      }

      if (window.slimeAudio) window.slimeAudio.playNoise(0.04, 0.3, 1600);
      this.addCoins(5, b.x, b.y, '+5 🪙');
    }

    spawnSquishParticles(x, y) {
      const count = this.slime.texture === 'floam' ? 12 : 8;
      for (let i = 0; i < count; i++) {
        let col = this.slime.color;
        if (this.slime.texture === 'cloud') {
          col = 'rgba(255, 255, 255, 0.85)';
        } else if (this.slime.texture === 'floam') {
          const beadCols = ['#ffffff', '#ff99c8', '#70e000', '#ffd166', '#00f5d4'];
          col = beadCols[i % beadCols.length];
        } else if (this.slime.texture === 'glitter' || this.slime.texture === 'gold') {
          col = '#ffd166';
        }
        this.particles.push(new Particle(x, y, col, 4.5, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, 0.65, true));
      }
    }

    spawnUnstickParticles(x, y) {
      for (let i = 0; i < 6; i++) {
        this.particles.push(new Particle(x, y, this.slime.color, 3.5, (Math.random() - 0.5) * 4, 1 + Math.random() * 3, 0.7, true));
      }
    }

    spawnGlitterDust(x, y) {
      for (let i = 0; i < 14; i++) {
        this.particles.push(new Particle(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40, '#ffd166', 3.5, (Math.random() - 0.5) * 3, -1 - Math.random() * 3, 0.9, false));
      }
      if (window.slimeAudio) window.slimeAudio.playNoise(0.03, 0.15, 2000);
    }

    addCoins(amt, x = CANVAS_WIDTH / 2, y = CANVAS_HEIGHT / 2, text = null) {
      this.coins += amt;
      localStorage.setItem('slime_coins', this.coins);
      if (this.coinsVal) this.coinsVal.textContent = this.coins;
      if (this.shopCoinsVal) this.shopCoinsVal.textContent = this.coins;
      if (this.labCoinsVal) this.labCoinsVal.textContent = this.coins;

      // Spawn floating coin popup
      this.floatingCoins.push(new FloatingCoin(x, y - 20, text || `+${amt} 🪙`));

      // Coin bounce animation on header
      if (this.coinsBadge) {
        this.coinsBadge.classList.remove('bump');
        void this.coinsBadge.offsetWidth;
        this.coinsBadge.classList.add('bump');
      }
    }

    updateStats() {
      if (this.statSquishesEl) this.statSquishesEl.textContent = this.statSquishes;
      if (this.statStretchesEl) this.statStretchesEl.textContent = this.statStretches;
    }

    setStickiness(lvl) {
      this.slime.stickiness = lvl;
      this.slime.hoverStickMax = STICKINESS_HOLD_TIMES[lvl] || 1.5;

      // Update toolbar active button
      this.quickStickButtons.forEach(b => {
        const blvl = parseInt(b.getAttribute('data-level'), 10);
        b.classList.toggle('active', blvl === lvl);
      });

      // Update HUD & Chip labels
      const trait = STICKINESS_TRAITS[lvl];
      if (this.activeStickinessTag && trait) {
        this.activeStickinessTag.textContent = `Stickiness: ${trait.name} (${trait.hold}s Hover Stick)`;
      }
      if (this.hudStickinessLabel && trait) {
        this.hudStickinessLabel.textContent = `Level ${lvl} (${trait.hold}s)`;
      }

      if (window.slimeAudio) window.slimeAudio.playASMRSquish(lvl);
    }

    setToolMode(mode) {
      this.activeTool = mode;
      Object.keys(this.toolBtns).forEach(m => {
        if (this.toolBtns[m]) {
          this.toolBtns[m].classList.toggle('active', m === mode);
        }
      });
    }

    resetShape() {
      this.slime.resetShape();
      if (window.slimeAudio) window.slimeAudio.playASMRSquish(this.slime.stickiness);
    }

    toggleSound() {
      if (!window.slimeAudio) return;
      const isMuted = window.slimeAudio.toggleMute();
      this.soundToggleBtn.textContent = isMuted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
      this.soundToggleBtn.classList.toggle('muted', isMuted);
    }

    // Responsive Canvas Screen Warper
    warpGameToScreen() {
      if (!this.canvasStage || !this.canvasWrapper) return;
      const availableW = this.canvasStage.clientWidth;
      const availableH = this.canvasStage.clientHeight;
      if (availableW <= 0 || availableH <= 0) return;

      const targetRatio = CANVAS_WIDTH / CANVAS_HEIGHT; // 960 / 540 = 1.777
      let w = availableW;
      let h = w / targetRatio;

      if (h > availableH) {
        h = availableH;
        w = h * targetRatio;
      }

      this.canvasWrapper.style.width = `${Math.floor(w)}px`;
      this.canvasWrapper.style.height = `${Math.floor(h)}px`;
    }

    // --- Slime Studio Initialization & UI Population ---
    initStudio() {
      // 1. Populate Quick Colors in bottom toolbar
      if (this.quickColorsRow) {
        this.quickColorsRow.innerHTML = '';
        PRESET_COLORS.slice(0, 7).forEach(c => {
          const dot = document.createElement('div');
          dot.className = `quick-color-dot ${this.slime.color === c.hex ? 'active' : ''}`;
          dot.style.backgroundColor = c.hex;
          dot.title = c.name;
          dot.addEventListener('click', () => {
            this.slime.color = c.hex;
            document.querySelectorAll('.quick-color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            if (window.slimeAudio) window.slimeAudio.playASMRSquish(this.slime.stickiness);
          });
          this.quickColorsRow.appendChild(dot);
        });
      }

      // 2. Setup Slime Maker Studio Form
      this.initSlimeMakerForm();

      // 3. Setup Texture Boutique Shop
      this.initTextureShop();

      // Update header labels
      this.updateHeaderProfile();
    }

    updateHeaderProfile() {
      const tex = SLIME_TEXTURES[this.slime.texture] || SLIME_TEXTURES.cloud;
      if (this.activeSlimeIcon) this.activeSlimeIcon.textContent = tex.icon;
      if (this.activeSlimeName) this.activeSlimeName.textContent = tex.name;
      const trait = STICKINESS_TRAITS[this.slime.stickiness] || STICKINESS_TRAITS[3];
      if (this.activeStickinessTag) {
        this.activeStickinessTag.textContent = `Stickiness: ${trait.name} (${trait.hold}s Hover Stick)`;
      }
      if (this.coinsVal) this.coinsVal.textContent = this.coins;
    }

    // Slime Maker Recipe Dialog Initialization
    initSlimeMakerForm() {
      // A. Textures Selector in Maker
      if (this.makerTextureSelectRow) {
        this.makerTextureSelectRow.innerHTML = '';
        Object.values(SLIME_TEXTURES).forEach(t => {
          const isOwned = this.unlockedTextures.includes(t.id);
          const btn = document.createElement('button');
          btn.className = `texture-select-btn ${this.slime.texture === t.id ? 'active' : ''}`;
          btn.innerHTML = `${t.icon} <span>${t.name}</span>`;
          if (!isOwned) {
            btn.innerHTML += ` <small style="color:#ffd166;">(🪙${t.price})</small>`;
          }
          btn.addEventListener('click', () => {
            if (!isOwned) {
              // Open texture shop to purchase
              this.closeMaker();
              this.openShop();
              return;
            }
            this.makerSelectedTexture = t.id;
            document.querySelectorAll('.texture-select-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (this.activeTextureLabel) {
              this.activeTextureLabel.innerHTML = `Texture: <strong>${t.name}</strong>`;
            }
            if (window.slimeAudio) {
              if (t.id === 'cloud') window.slimeAudio.playCloudPuff();
              else if (t.id === 'floam') window.slimeAudio.playFoamCrunch();
              else window.slimeAudio.playASMRSquish(3);
            }
          });
          this.makerTextureSelectRow.appendChild(btn);
        });
      }

      // B. Color Palette Swatches
      if (this.colorPalette) {
        this.colorPalette.innerHTML = '';
        PRESET_COLORS.forEach(c => {
          const sw = document.createElement('div');
          sw.className = `color-swatch ${this.slime.color === c.hex ? 'active' : ''}`;
          sw.style.backgroundColor = c.hex;
          sw.title = c.name;
          sw.addEventListener('click', () => {
            this.makerSelectedColor = c.hex;
            if (this.customColorPicker) this.customColorPicker.value = c.hex;
            document.querySelectorAll('.color-palette .color-swatch').forEach(s => s.classList.remove('active'));
            sw.classList.add('active');
            if (window.slimeAudio) window.slimeAudio.playASMRSquish(3);
          });
          this.colorPalette.appendChild(sw);
        });
      }

      // C. Custom Color Picker & Dual Swirl
      if (this.customColorPicker) {
        this.customColorPicker.addEventListener('input', (e) => {
          this.makerSelectedColor = e.target.value;
          document.querySelectorAll('.color-palette .color-swatch').forEach(s => s.classList.remove('active'));
        });
      }

      if (this.dualSwirlToggle && this.customColorPicker2) {
        this.dualSwirlToggle.addEventListener('change', (e) => {
          this.customColorPicker2.classList.toggle('hidden', !e.target.checked);
        });
      }

      // D. Stickiness Slider
      if (this.stickinessSlider) {
        this.stickinessSlider.value = this.slime.stickiness;
        this.stickinessSlider.addEventListener('input', (e) => {
          const lvl = parseInt(e.target.value, 10);
          const trait = STICKINESS_TRAITS[lvl];
          if (this.stickinessValueLabel && trait) {
            this.stickinessValueLabel.textContent = trait.name;
          }
          if (this.stickinessTraitDesc && trait) {
            this.stickinessTraitDesc.textContent = trait.desc;
          }
          if (this.stickinessPreviewTag && trait) {
            this.stickinessPreviewTag.innerHTML = `Hold Time: <strong>${trait.hold}s Hover Stick</strong>`;
          }
          if (window.slimeAudio) window.slimeAudio.playASMRSquish(lvl);
        });
      }

      // E. Charms Chips
      if (this.charmsPickerRow) {
        this.charmsPickerRow.querySelectorAll('.charm-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            this.charmsPickerRow.querySelectorAll('.charm-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            this.makerSelectedCharm = chip.getAttribute('data-charm');
          });
        });
      }

      // F. Mix & Pour Slime Action Button
      if (this.createSlimeBtn) {
        this.createSlimeBtn.addEventListener('click', () => {
          const color = this.makerSelectedColor || (this.customColorPicker ? this.customColorPicker.value : '#80deea');
          const secondaryColor = this.customColorPicker2 ? this.customColorPicker2.value : '#ff80bf';
          const hasDualSwirl = this.dualSwirlToggle ? this.dualSwirlToggle.checked : false;
          const texture = this.makerSelectedTexture || this.slime.texture;
          const stickiness = this.stickinessSlider ? parseInt(this.stickinessSlider.value, 10) : 3;
          const charm = this.makerSelectedCharm || 'none';

          // Apply recipe to main slime
          this.slime.applyRecipe({
            color,
            secondaryColor,
            hasDualSwirl,
            texture,
            stickiness,
            charm
          });

          // Reset shape for fresh pour
          this.resetShape();
          this.updateHeaderProfile();
          this.setStickiness(stickiness);

          // Rewarded with crafting bonus coins!
          this.addCoins(25, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '+25 🪙 Crafted!');

          // Play triumph celebration sound
          if (window.slimeAudio) window.slimeAudio.playBuySound();

          // Button feedback
          this.createSlimeBtn.textContent = '✨ Poured & Ready!';
          setTimeout(() => {
            this.createSlimeBtn.textContent = '✨ Mix & Pour My Slime!';
            this.closeMaker();
          }, 700);
        });
      }

      // G. Setup Live Recipe Preview Bowl Loop
      this.setupMakerBowlPreview();
    }

    setupMakerBowlPreview() {
      const canvas = this.slimePreviewCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const cw = canvas.width;
      const ch = canvas.height;

      const render = () => {
        ctx.clearRect(0, 0, cw, ch);

        const bowlX = cw / 2;
        const bowlY = ch * 0.72;
        const bowlR = 68;

        // Bowl back
        ctx.save();
        ctx.fillStyle = '#162842';
        ctx.beginPath();
        ctx.ellipse(bowlX, bowlY, bowlR, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Slime Blob preview
        const curCol = this.makerSelectedColor || (this.customColorPicker ? this.customColorPicker.value : '#80deea');
        const grad = ctx.createRadialGradient(bowlX - 10, bowlY - 24, 5, bowlX, bowlY, bowlR);
        const curGrad = generateSlimeGradient(curCol);
        grad.addColorStop(0, curGrad[0]);
        grad.addColorStop(0.3, curGrad[1]);
        grad.addColorStop(0.7, curGrad[2]);
        grad.addColorStop(1, curGrad[3]);

        ctx.fillStyle = grad;
        ctx.strokeStyle = '#1e2430';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(bowlX - bowlR * 0.7, bowlY + 4);
        ctx.quadraticCurveTo(bowlX - 35, bowlY - 32, bowlX, bowlY - 34);
        ctx.quadraticCurveTo(bowlX + 35, bowlY - 32, bowlX + bowlR * 0.7, bowlY + 4);
        ctx.quadraticCurveTo(bowlX, bowlY + 16, bowlX - bowlR * 0.7, bowlY + 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Texture details in preview bowl
        const curTex = this.makerSelectedTexture || this.slime.texture;
        if (curTex === 'cloud') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(bowlX - 16, bowlY - 22, 14, 0, Math.PI * 2);
          ctx.arc(bowlX + 16, bowlY - 22, 14, 0, Math.PI * 2);
          ctx.arc(bowlX, bowlY - 26, 16, 0, Math.PI * 2);
          ctx.fill();
        } else if (curTex === 'floam') {
          const beadColors = ['#ffffff', '#ff99c8', '#70e000', '#ffd166', '#00f5d4'];
          [[-20, -10], [-8, -20], [10, -18], [22, -8], [0, -6]].forEach(([ox, oy], i) => {
            ctx.fillStyle = beadColors[i % beadColors.length];
            ctx.beginPath();
            ctx.arc(bowlX + ox, bowlY + oy, 4, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Bowl front rim
        ctx.save();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#2b4d75';
        ctx.beginPath();
        ctx.ellipse(bowlX, bowlY, bowlR, 22, 0, 0, Math.PI);
        ctx.stroke();
        ctx.restore();

        requestAnimationFrame(render);
      };

      requestAnimationFrame(render);
    }

    // Texture Shop Modal Initialization
    initTextureShop() {
      if (!this.texturesGrid) return;
      this.texturesGrid.innerHTML = '';

      Object.values(SLIME_TEXTURES).forEach(t => {
        const isOwned = this.unlockedTextures.includes(t.id);
        const isActive = this.slime.texture === t.id;

        const card = document.createElement('div');
        card.className = `texture-card ${isActive ? 'equipped' : ''}`;

        // Preview Canvas
        const preview = document.createElement('canvas');
        preview.width = 80;
        preview.height = 55;
        preview.className = 'texture-preview-canvas';
        const pCtx = preview.getContext('2d');
        this.drawTextureShopPreview(pCtx, t);

        const nameEl = document.createElement('div');
        nameEl.className = 'texture-name';
        nameEl.textContent = t.name;

        const tagEl = document.createElement('div');
        tagEl.className = 'texture-price-tag';
        tagEl.textContent = isOwned ? 'UNLOCKED' : `🪙 ${t.price} Coins`;

        const descEl = document.createElement('div');
        descEl.className = 'texture-desc';
        descEl.textContent = t.desc;

        const btn = document.createElement('button');
        btn.className = 'btn btn-texture-action';

        if (isOwned) {
          if (isActive) {
            btn.className += ' btn-texture-equip';
            btn.textContent = '✓ Active';
            btn.disabled = true;
          } else {
            btn.className += ' btn-texture-equip';
            btn.textContent = 'Equip Texture';
            btn.addEventListener('click', () => {
              this.slime.texture = t.id;
              this.initTextureShop();
              this.initSlimeMakerForm();
              this.updateHeaderProfile();
              if (window.slimeAudio) {
                if (t.id === 'cloud') window.slimeAudio.playCloudPuff();
                else if (t.id === 'floam') window.slimeAudio.playFoamCrunch();
                else window.slimeAudio.playASMRSquish(3);
              }
            });
          }
        } else {
          btn.className += ' btn-texture-buy';
          const canAfford = this.coins >= t.price;
          btn.textContent = canAfford ? `Buy for 🪙${t.price}` : `Need ${t.price - this.coins} more 🪙`;
          if (!canAfford) btn.style.opacity = '0.65';

          btn.addEventListener('click', () => {
            if (this.coins >= t.price) {
              this.addCoins(-t.price);
              this.unlockedTextures.push(t.id);
              localStorage.setItem('slime_unlocked_textures', JSON.stringify(this.unlockedTextures));
              this.slime.texture = t.id;
              this.initTextureShop();
              this.initSlimeMakerForm();
              this.updateHeaderProfile();
              if (window.slimeAudio) window.slimeAudio.playBuySound();
            } else {
              if (this.coinsBadge) {
                this.coinsBadge.classList.remove('bump');
                void this.coinsBadge.offsetWidth;
                this.coinsBadge.classList.add('bump');
              }
            }
          });
        }

        card.appendChild(preview);
        card.appendChild(nameEl);
        card.appendChild(tagEl);
        card.appendChild(descEl);
        card.appendChild(btn);

        this.texturesGrid.appendChild(card);
      });
    }

    drawTextureShopPreview(ctx, t) {
      ctx.save();
      ctx.translate(40, 48);

      const r = 34;
      const grad = ctx.createRadialGradient(-10, -20, 5, 0, 0, r);
      if (t.id === 'gold') {
        grad.addColorStop(0, '#fffbe0');
        grad.addColorStop(0.35, '#ffd700');
        grad.addColorStop(0.5, '#cca000');
        grad.addColorStop(0.52, '#fff3a8');
        grad.addColorStop(0.8, '#b8860b');
        grad.addColorStop(1, '#5c4308');
      } else if (t.id === 'cloud') {
        grad.addColorStop(0, '#e0f7fa');
        grad.addColorStop(0.3, '#b2ebf2');
        grad.addColorStop(0.7, '#80deea');
        grad.addColorStop(1, '#26c6da');
      } else if (t.id === 'crystal') {
        grad.addColorStop(0, 'rgba(224, 247, 250, 0.9)');
        grad.addColorStop(0.5, 'rgba(128, 222, 234, 0.7)');
        grad.addColorStop(1, 'rgba(0, 188, 212, 0.5)');
      } else if (t.id === 'floam') {
        grad.addColorStop(0, '#ffccd5');
        grad.addColorStop(0.4, '#ff758f');
        grad.addColorStop(1, '#c9184a');
      } else if (t.id === 'butter') {
        grad.addColorStop(0, '#fff3b0');
        grad.addColorStop(0.4, '#ffe66d');
        grad.addColorStop(1, '#e9c46a');
      } else if (t.id === 'glitter') {
        grad.addColorStop(0, '#e0aaff');
        grad.addColorStop(0.4, '#c77dff');
        grad.addColorStop(1, '#7b2cbf');
      } else {
        grad.addColorStop(0, '#9ef01a');
        grad.addColorStop(0.4, '#38b000');
        grad.addColorStop(1, '#007200');
      }

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#1e1e24';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Texture Specific Overlays
      if (t.id === 'cloud') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(-14, -14, 11, 0, Math.PI * 2);
        ctx.arc(0, -22, 12, 0, Math.PI * 2);
        ctx.arc(14, -14, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (t.id === 'floam') {
        const beads = ['#fff', '#00f5d4', '#ffd166', '#ff007f'];
        [[-16, -10], [-6, -20], [8, -16], [16, -8], [-2, -8]].forEach(([bx, by], i) => {
          ctx.fillStyle = beads[i % beads.length];
          ctx.beginPath();
          ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (t.id === 'butter') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-18, -10);
        ctx.quadraticCurveTo(0, -22, 18, -8);
        ctx.stroke();
      } else if (t.id === 'glitter') {
        ctx.fillStyle = '#fff3a8';
        [[-12, -14], [10, -18], [0, -8]].forEach(([sx, sy]) => {
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (t.id === 'crystal') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -8);
        ctx.lineTo(0, -26);
        ctx.lineTo(16, -8);
        ctx.stroke();
      }

      ctx.restore();
    }

    openMaker() {
      if (this.slimeMakerModal) {
        this.slimeMakerModal.classList.remove('hidden');
        if (this.labCoinsVal) this.labCoinsVal.textContent = this.coins;
      }
    }

    closeMaker() {
      if (this.slimeMakerModal) this.slimeMakerModal.classList.add('hidden');
      this.warpGameToScreen();
    }

    openShop() {
      if (this.textureShopModal) {
        this.textureShopModal.classList.remove('hidden');
        if (this.shopCoinsVal) this.shopCoinsVal.textContent = this.coins;
        this.initTextureShop();
      }
    }

    closeShop() {
      if (this.textureShopModal) this.textureShopModal.classList.add('hidden');
      this.warpGameToScreen();
    }

    // --- Main Rendering & Animation Loop ---
    loop(timestamp) {
      const dt = Math.min(0.04, (timestamp - this.lastTime) / 1000);
      this.lastTime = timestamp;

      // 1. Update Soft-body Physics Simulation
      this.slime.updatePhysics(dt);

      // 2. Render Slime Studio Workbench Canvas
      this.render();

      requestAnimationFrame((t) => this.loop(t));
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // A. Studio Mat Background
      this.drawStudioTable(ctx);

      // B. Draw Interactive Slime Blob
      this.slime.draw(ctx);

      // C. Draw Interactive Slime Bubbles
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        const b = this.bubbles[i];
        b.update(0.016);
        b.draw(ctx);
        if (b.life <= 0) this.bubbles.splice(i, 1);
      }

      // D. Draw Particles (Squish, unstick, glitter)
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.update(0.016);
        p.draw(ctx);
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      // E. Draw Floating Coin Popups
      for (let i = this.floatingCoins.length - 1; i >= 0; i--) {
        const c = this.floatingCoins[i];
        c.update(0.016);
        c.draw(ctx);
        if (c.life <= 0) this.floatingCoins.splice(i, 1);
      }
    }

    drawStudioTable(ctx) {
      // Tabletop gradient (clean modern marble / pastel studio look)
      const bgGrad = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 80,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 480
      );
      bgGrad.addColorStop(0, '#1c314a');
      bgGrad.addColorStop(0.6, '#0f2038');
      bgGrad.addColorStop(1, '#081424');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Concentric circular play mat rings beneath slime
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 185, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 230, 0, Math.PI * 2);
      ctx.stroke();

      // Subtle table grid texture lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 60; x < CANVAS_WIDTH; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 60; y < CANVAS_HEIGHT; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Launch on DOM Ready
  window.addEventListener('DOMContentLoaded', () => {
    window.slimeStudio = new SlimeStudio();
  });
})();
