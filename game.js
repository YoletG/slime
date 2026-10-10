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
    crunchy: {
      id: 'crunchy',
      name: 'Crispy Bingsu 🍧',
      price: 200,
      icon: '🍧',
      tagline: 'Ultra-crispy beads & crackles',
      desc: 'Packed with thousands of iridescent faceted Bingsu beads that crackle, crunch, and pop with loud ASMR clicks on every squish!'
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

      // Physical Mass, Density & Fluid Bulk Properties
      this.density = this.getTextureDensity(this.texture);
      this.totalMass = this.calculateTotalMass();
      this.vertexMass = this.totalMass / NUM_VERTICES;

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
          pinned: false,
          mass: this.vertexMass
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

      // Real Slime Relaxation & Pooling (flattens and gets bigger if not touched)
      this.untouchedTimer = 0;
      this.meltProgress = 0; // 0 = bouncy rounded dome, 1 = relaxed flat pool

      // Micro-bubbles trapped inside real slime matrix (creates authentic translucent depth)
      this.microBubbles = [];
      for (let i = 0; i < 34; i++) {
        const dist = Math.sqrt(Math.random()) * (radius * 0.88);
        const ang = Math.random() * Math.PI * 2;
        this.microBubbles.push({
          distRatio: dist / radius,
          ang: ang,
          size: 1.6 + Math.random() * 2.6,
          alpha: 0.35 + Math.random() * 0.4
        });
      }

      // Iridescent Faceted Beads for Crunchy Bingsu Texture
      this.bingsuBeads = [];
      const bingsuColors = [
        'rgba(255, 255, 255, 0.85)',
        'rgba(255, 182, 193, 0.85)',
        'rgba(175, 238, 238, 0.85)',
        'rgba(255, 240, 180, 0.85)',
        'rgba(221, 160, 221, 0.85)',
        'rgba(180, 255, 210, 0.85)'
      ];
      for (let i = 0; i < 48; i++) {
        const dist = Math.sqrt(Math.random()) * (radius * 0.86);
        const ang = Math.random() * Math.PI * 2;
        this.bingsuBeads.push({
          distRatio: dist / radius,
          ang: ang,
          w: 6 + Math.random() * 6,
          h: 4 + Math.random() * 4,
          rot: Math.random() * Math.PI,
          color: bingsuColors[Math.floor(Math.random() * bingsuColors.length)],
          shimmer: Math.random() * Math.PI * 2
        });
      }

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

    // --- Physical Mass & Geometry Helpers ---
    getTextureDensity(texture = this.texture) {
      const densities = {
        cloud: 0.65,    // Light, whipped, fluffy snow-powder
        floam: 0.85,    // Micro-polystyrene beads in gel
        classic: 1.00,  // Standard translucent PVA-borate gel
        glitter: 1.04,  // Foil glitter star flakes
        crystal: 1.08,  // Dense optical clear glass gel
        crunchy: 1.18,  // Crispy bingsu faceted beads
        butter: 1.25,   // Heavy velvety clay-infused spread
        gold: 1.35      // Molten heavy metallic chrome
      };
      return densities[texture] || 1.00;
    }

    calculateTotalMass() {
      // Physical soft-body mass calculation: M = density * Area_base * scale
      // Normalized in simulation mass units (kg equivalent)
      const rRatio = this.baseRadius / 100;
      const baseArea = Math.PI * rRatio * rRatio;
      return this.density * baseArea * 28.0;
    }

    setTexture(newTexture) {
      this.texture = newTexture;
      this.density = this.getTextureDensity(newTexture);
      this.totalMass = this.calculateTotalMass();
      this.vertexMass = this.totalMass / NUM_VERTICES;
      for (let i = 0; i < this.vertices.length; i++) {
        this.vertices[i].mass = this.vertexMass;
      }
    }

    getPolygonArea() {
      let area = 0;
      const n = this.vertices.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += this.vertices[i].x * this.vertices[j].y - this.vertices[j].x * this.vertices[i].y;
      }
      return Math.abs(area) * 0.5;
    }

    getCentroid() {
      let cx = 0, cy = 0;
      const n = this.vertices.length;
      for (let i = 0; i < n; i++) {
        cx += this.vertices[i].x;
        cy += this.vertices[i].y;
      }
      return { x: cx / n, y: cy / n };
    }

    applyRecipe({ color, secondaryColor, hasDualSwirl, texture, stickiness, charm }) {
      if (color) this.color = color;
      if (secondaryColor) this.secondaryColor = secondaryColor;
      if (hasDualSwirl !== undefined) this.hasDualSwirl = hasDualSwirl;
      if (texture) {
        this.setTexture(texture);
      }
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
      this.untouchedTimer = 0;
      this.meltProgress = Math.max(0, this.meltProgress - 0.28); // firm up when touched
      const targetIdx = this.getNearestVertexIndex(x, y);

      // Direction from center to squish point
      const dx = x - this.cx;
      const dy = y - this.cy;
      const dist = Math.hypot(dx, dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;

      // Inward indentation impulse scaled by physical vertex mass (inertia)
      const impulse = (force * 2.2) / Math.sqrt(this.vertexMass || 1);
      const n = this.vertices.length;

      // Smooth cosine bell distribution over neighboring vertices (organic thumbprint depression)
      for (let i = -4; i <= 4; i++) {
        const vIdx = (targetIdx + i + n) % n;
        const falloff = Math.cos((Math.abs(i) / 5) * (Math.PI / 2));
        this.vertices[vIdx].vx -= ux * impulse * falloff;
        this.vertices[vIdx].vy -= uy * impulse * falloff;
      }

      this.globalWobble = 0.55;
    }

    // ➰ 2. CLICK & DRAG TO STRETCH: 2D Viscous Putty Tendril that tracks mouse anywhere!
    startDrag(x, y) {
      this.untouchedTimer = 0;
      this.meltProgress = Math.max(0, this.meltProgress - 0.38); // firm up when stretched
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
      this.untouchedTimer = 0;
      this.dragPrevX = this.dragX;
      this.dragPrevY = this.dragY;
      this.dragX = x;
      this.dragY = y;
    }

    endDrag() {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.untouchedTimer = 0;
      if (this.dragIndex !== -1) {
        const n = this.vertices.length;
        // Elastic rebound: unpin all tendril vertices with smooth, capped rebound impulse scaled by mass
        const maxSnapVel = 120;
        const snapRate = 0.45 / Math.sqrt(this.density || 1);
        for (let i = 0; i < n; i++) {
          const v = this.vertices[i];
          if (v.pinned) {
            const dispX = v.x - v.restX;
            const dispY = v.y - v.restY;
            v.vx = Math.max(-maxSnapVel, Math.min(maxSnapVel, -dispX * snapRate));
            v.vy = Math.max(-maxSnapVel, Math.min(maxSnapVel, -dispY * snapRate));
            v.pinned = false;
          }
        }
        this.globalWobble = 0.75;
      }
      this.dragIndex = -1;
      this.stretchDistance = 0;
    }

    // 🍯 3. HOVER STICKINESS: Adheres to cursor, holds for duration, then lets go!
    updateHover(mouseX, mouseY, dt, audioSystem) {
      if (this.hoverCooldown > 0) {
        this.hoverCooldown -= dt;
      }

      const isInside = this.containsPoint(mouseX, mouseY);

      // If hovering over slime, not currently dragging, and cooldown expired -> STICK!
      if (isInside && !this.isDragging && !this.isHoverStuck && this.hoverCooldown <= 0) {
        this.untouchedTimer = 0;
        this.isHoverStuck = true;
        this.hoverStickMax = STICKINESS_HOLD_TIMES[this.stickiness] || 1.5;
        this.hoverStickTimer = this.hoverStickMax;
        this.hoverStickX = mouseX;
        this.hoverStickY = mouseY;
        this.hoverVertexIdx = this.getNearestVertexIndex(mouseX, mouseY);

        if (audioSystem) {
          audioSystem.playASMRSquish(Math.max(1, this.stickiness - 1));
        }
      }

      // While hovering stuck
      if (this.isHoverStuck) {
        this.untouchedTimer = 0;
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
            const pullVelX = (mouseX - hv.x) * 0.5;
            const pullVelY = (mouseY - hv.y) * 0.5;
            hv.vx -= Math.max(-90, Math.min(90, pullVelX));
            hv.vy -= Math.max(-90, Math.min(90, pullVelY));
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

    // Soft-body Viscoelastic Spring Simulation Step with Physical Mass & Incompressibility
    updatePhysics(dt) {
      const n = this.vertices.length;
      this.idlePhase += dt * 3.2;

      // 0. Update Untouched / Melt Pooling State
      // Real slime oozes, relaxes, flattens, and spreads bigger when left untouched!
      if (this.isDragging || this.isHoverStuck) {
        this.untouchedTimer = 0;
        this.meltProgress = Math.max(0, this.meltProgress - dt * 3.5);
      } else {
        this.untouchedTimer += dt;
        if (this.untouchedTimer > 1.2) {
          // Slowly pool and flatten over ~3.5 seconds
          const targetMelt = Math.min(1.0, (this.untouchedTimer - 1.2) / 3.2);
          this.meltProgress += (targetMelt - this.meltProgress) * (dt * 1.5);
        } else {
          this.meltProgress += (0 - this.meltProgress) * (dt * 2.2);
        }
      }

      // Base idle breathing oscillation (damped down when flat and relaxed)
      const idleWobble = Math.sin(this.idlePhase) * (2.2 * (1 - this.meltProgress * 0.6));
      const currentRadius = this.baseRadius + idleWobble;

      // Melt expansion and flattening scales
      // Expands up to +42% bigger, flattens vertically by -22%, spreads horizontally by +16%
      const expansion = 1.0 + this.meltProgress * 0.42;
      const rxScale = expansion * (1.0 + this.meltProgress * 0.16);
      const ryScale = expansion * (1.0 - this.meltProgress * 0.22);

      // 1. Viscous drag tracking & anti-folding tendril geometry
      if (this.isDragging && this.dragIndex !== -1) {
        const viscousFollow = 0.42;
        this.dragSmoothX += (this.dragX - this.dragSmoothX) * viscousFollow;
        this.dragSmoothY += (this.dragY - this.dragSmoothY) * viscousFollow;

        // Core containment: prevent cursor from dragging boundary through centroid
        const toCentCursorX = this.dragSmoothX - this.cx;
        const toCentCursorY = this.dragSmoothY - this.cy;
        const cursorDist = Math.hypot(toCentCursorX, toCentCursorY);
        const minCoreDist = currentRadius * 0.35;
        if (cursorDist < minCoreDist) {
          const uDist = cursorDist > 0.001 ? cursorDist : 1;
          this.dragSmoothX = this.cx + (toCentCursorX / uDist) * minCoreDist;
          this.dragSmoothY = this.cy + (toCentCursorY / uDist) * minCoreDist;
        }

        // Transverse curvature / catenary lag
        const mdx = this.dragX - this.dragPrevX;
        const mdy = this.dragY - this.dragPrevY;
        const toCursorX = this.dragSmoothX - this.cx;
        const toCursorY = this.dragSmoothY - this.cy;
        const cursorDistEff = Math.hypot(toCursorX, toCursorY) || 1;
        const normCursorX = -toCursorY / cursorDistEff;
        const normCursorY = toCursorX / cursorDistEff;
        const lateralSpeed = mdx * normCursorX + mdy * normCursorY;
        this.tendrilCurvature += (lateralSpeed * 1.8 - this.tendrilCurvature) * 0.18;
        this.tendrilCurvature *= 0.94;

        const g = this.dragIndex;
        const K = 5; // 5 neighbors on each side = 11 tendril vertices

        const anchorLIdx = (g - K - 1 + n) % n;
        const anchorRIdx = (g + K + 1) % n;
        const anchorL = this.vertices[anchorLIdx];
        const anchorR = this.vertices[anchorRIdx];

        const baseMidX = (anchorL.x + anchorR.x) * 0.5;
        const baseMidY = (anchorL.y + anchorR.y) * 0.5;

        const pullX = this.dragSmoothX - baseMidX;
        const pullY = this.dragSmoothY - baseMidY;
        const pullLen = Math.hypot(pullX, pullY);
        this.stretchDistance = pullLen;

        const pullTanX = pullLen > 0.001 ? pullX / pullLen : 1;
        const pullTanY = pullLen > 0.001 ? pullY / pullLen : 0;
        const pullNormX = -pullTanY;
        const pullNormY = pullTanX;

        // Anti-twist side check: ensure left and right tendril flanks never cross each other
        const toAnchorLX = anchorL.x - baseMidX;
        const toAnchorLY = anchorL.y - baseMidY;
        const sideDot = toAnchorLX * pullNormX + toAnchorLY * pullNormY;
        const leftSideSign = sideDot >= 0 ? 1 : -1;

        const baseDist = Math.hypot(anchorL.x - anchorR.x, anchorL.y - anchorR.y);
        const wBase = Math.min(65, Math.max(30, baseDist * 0.48));
        const wTip = 14;

        // Viscous necking factor (mass conservation: neck narrows smoothly as stretch grows)
        const neckSensitivity = 55 + (5 - this.stickiness) * 10;
        const neckFactor = 1 / Math.sqrt(1 + Math.max(0, pullLen - 50) / neckSensitivity);

        // Position tip vertex directly at smoothed cursor position
        const tipV = this.vertices[g];
        tipV.x = this.dragSmoothX;
        tipV.y = this.dragSmoothY;
        tipV.vx = (this.dragX - this.dragPrevX) * 15;
        tipV.vy = (this.dragY - this.dragPrevY) * 15;
        tipV.pinned = true;

        // Shape each pair along tendril spine with guaranteed zero crossover
        for (let d = 1; d <= K; d++) {
          const t = 1 - d / (K + 1);

          let spineX = baseMidX + pullX * t;
          let spineY = baseMidY + pullY * t;

          const curveOffset = Math.sin(t * Math.PI) * this.tendrilCurvature;
          spineX += pullNormX * curveOffset;
          spineY += pullNormY * curveOffset;

          const wLinear = wBase * (1 - t) + wTip * t;
          const pinch = 4 * t * (1 - t) * (1 - neckFactor);
          const halfWidth = Math.max(9, wLinear * (1 - pinch));

          const targetLX = spineX + pullNormX * halfWidth * leftSideSign;
          const targetLY = spineY + pullNormY * halfWidth * leftSideSign;
          const targetRX = spineX - pullNormX * halfWidth * leftSideSign;
          const targetRY = spineY - pullNormY * halfWidth * leftSideSign;

          const leftIdx = (g - d + n) % n;
          const rightIdx = (g + d) % n;
          const leftV = this.vertices[leftIdx];
          const rightV = this.vertices[rightIdx];

          const pullRatio = 0.50 + t * 0.40;
          leftV.x += (targetLX - leftV.x) * pullRatio;
          leftV.y += (targetLY - leftV.y) * pullRatio;
          leftV.vx = (targetLX - leftV.x) * 12;
          leftV.vy = (targetLY - leftV.y) * 12;
          leftV.pinned = true;

          rightV.x += (targetRX - rightV.x) * pullRatio;
          rightV.y += (targetRY - rightV.y) * pullRatio;
          rightV.vx = (targetRX - rightV.x) * 12;
          rightV.vy = (targetRY - rightV.y) * 12;
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

      // 2. Resting positions update (incorporates melt pooling expansion & flattening)
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
        const rx = currentRadius * rxScale * bodyContraction;
        const ry = currentRadius * ryScale * bodyContraction;
        v.restX = this.cx + bodyShiftX + Math.cos(v.restAngle) * rx;
        v.restY = this.cy + bodyShiftY + Math.sin(v.restAngle) * ry;
      }

      // 3. Multi-substep Physical Mass, Internal Pressure & Anti-Fold Solver
      const subSteps = 3;
      const subDt = Math.min(0.02, dt) / subSteps;
      const density = this.density || 1.0;

      const kRest = 75.0 * density;
      const kNeighbor = 65.0 * density;
      const kBend = 45.0 * density;
      const kPressure = 1400.0 * density;
      const cDamp = (5.2 + (this.stickiness - 1) * 1.5) * density;
      const targetArea = Math.PI * (currentRadius * expansion) * (currentRadius * expansion);
      const coreRadius = currentRadius * 0.40;
      const hardFloor = currentRadius * 0.26;
      const kCore = 240.0 * density;

      for (let step = 0; step < subSteps; step++) {
        const curArea = this.getPolygonArea();
        let pGauge = kPressure * (targetArea - curArea) / targetArea;
        pGauge = Math.max(-500, Math.min(1500, pGauge));

        const centroid = this.getCentroid();

        for (let i = 0; i < n; i++) {
          const v = this.vertices[i];
          if (v.pinned) continue;

          const prev = this.vertices[(i - 1 + n) % n];
          const next = this.vertices[(i + 1) % n];

          // 1. Equilibrium shape restoring spring
          const fRestX = -kRest * (v.x - v.restX);
          const fRestY = -kRest * (v.y - v.restY);

          // 2. Neighbor edge tension
          const avgNeighborX = (prev.x + next.x) * 0.5;
          const avgNeighborY = (prev.y + next.y) * 0.5;
          const fEdgeX = kNeighbor * (avgNeighborX - v.x);
          const fEdgeY = kNeighbor * (avgNeighborY - v.y);

          // 3. Curvature bending resistance (anti-crease / smooth plump boundary)
          const dxEdge = next.x - prev.x;
          const dyEdge = next.y - prev.y;
          const edgeLen = Math.hypot(dxEdge, dyEdge) || 1.0;
          const normOutX = dyEdge / edgeLen;
          const normOutY = -dxEdge / edgeLen;
          const sag = currentRadius * (1.0 - Math.cos(Math.PI / n));
          const smoothX = avgNeighborX + normOutX * sag;
          const smoothY = avgNeighborY + normOutY * sag;
          const fBendX = kBend * (smoothX - v.x);
          const fBendY = kBend * (smoothY - v.y);

          // 4. Incompressible hydrostatic gauge fluid pressure force
          const fPressX = 0.5 * pGauge * dyEdge;
          const fPressY = -0.5 * pGauge * dxEdge;

          // 5. Anti-inversion core repulsion barrier
          const toCentX = v.x - centroid.x;
          const toCentY = v.y - centroid.y;
          const distCent = Math.hypot(toCentX, toCentY) || 0.001;
          const uCentX = toCentX / distCent;
          const uCentY = toCentY / distCent;

          let fCoreX = 0, fCoreY = 0;
          if (distCent < coreRadius) {
            const penetration = (coreRadius - distCent) / coreRadius;
            const fCoreMag = kCore * penetration * v.mass * 100.0;
            fCoreX = uCentX * fCoreMag;
            fCoreY = uCentY * fCoreMag;
          }

          // 6. Viscous damping
          const fDampX = -cDamp * v.vx;
          const fDampY = -cDamp * v.vy;

          // Newton's Second Law: a = F_net / m
          const fTotalX = fRestX + fEdgeX + fBendX + fPressX + fCoreX + fDampX;
          const fTotalY = fRestY + fEdgeY + fBendY + fPressY + fCoreY + fDampY;
          const vMass = v.mass || this.vertexMass || 1.0;
          const ax = fTotalX / vMass;
          const ay = fTotalY / vMass;

          v.vx += ax * subDt;
          v.vy += ay * subDt;
          v.x += v.vx * subDt;
          v.y += v.vy * subDt;

          // Absolute hard-floor core penetration guard
          const distAfter = Math.hypot(v.x - centroid.x, v.y - centroid.y);
          if (distAfter < hardFloor) {
            v.x = centroid.x + uCentX * hardFloor;
            v.y = centroid.y + uCentY * hardFloor;
            v.vx *= 0.2;
            v.vy *= 0.2;
          }
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
      this.untouchedTimer = 0;
      this.meltProgress = 0;
      this.density = this.getTextureDensity(this.texture);
      this.totalMass = this.calculateTotalMass();
      this.vertexMass = this.totalMass / NUM_VERTICES;
      for (let i = 0; i < this.vertices.length; i++) {
        const v = this.vertices[i];
        v.x = this.cx + Math.cos(v.restAngle) * this.baseRadius;
        v.y = this.cy + Math.sin(v.restAngle) * this.baseRadius;
        v.vx = 0;
        v.vy = 0;
        v.pinned = false;
        v.mass = this.vertexMass;
      }
      this.globalWobble = 0.4;
    }

    // Draw the Slime on Studio Canvas with Real Slime Translucency, Depth & Textures
    draw(ctx) {
      ctx.save();

      // 1. Soft Table Contact Shadows (expands wider and flattens thinner as slime melts)
      ctx.save();
      const shadowW = this.baseRadius * 1.15 * (1.0 + this.meltProgress * 0.45);
      const shadowH = 22 * (1.0 - this.meltProgress * 0.28);
      const shadowY = this.cy + this.baseRadius * (0.72 - this.meltProgress * 0.2);
      ctx.fillStyle = `rgba(10, 20, 35, ${0.45 - this.meltProgress * 0.12})`;
      ctx.beginPath();
      ctx.ellipse(this.cx, shadowY, shadowW, Math.max(8, shadowH), 0, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic stretched shadow under the tendril
      if (this.isDragging && this.stretchDistance > 40) {
        ctx.fillStyle = 'rgba(10, 20, 35, 0.22)';
        const tipShadowX = this.dragSmoothX;
        const tipShadowY = shadowY + (this.dragSmoothY - this.cy) * 0.2;
        ctx.beginPath();
        ctx.ellipse(tipShadowX, tipShadowY, 26, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.cx, shadowY);
        ctx.lineTo(tipShadowX, tipShadowY);
        ctx.lineWidth = 22;
        ctx.strokeStyle = 'rgba(10, 20, 35, 0.16)';
        ctx.stroke();
      }
      ctx.restore();

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

      // 3. Rich Dynamic 3D Radial Gradient Jelly Fill (adapts to pooling puddle)
      let maxDist = this.baseRadius * (1.35 + this.meltProgress * 0.38);
      if (this.isDragging) {
        const dragDist = Math.hypot(this.dragSmoothX - this.cx, this.dragSmoothY - this.cy);
        maxDist = Math.max(maxDist, dragDist + 60);
      }
      const lightX = this.cx - this.baseRadius * 0.3 * (1 - this.meltProgress * 0.3);
      const lightY = this.cy - this.baseRadius * (0.35 - this.meltProgress * 0.18);
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
      } else if (this.texture === 'crunchy') {
        // Shimmering translucent candy jewel base for Bingsu
        grad.addColorStop(0, adjustColor(this.color, 0.65));
        grad.addColorStop(0.35, adjustColor(this.color, 0.25));
        grad.addColorStop(0.7, this.color);
        grad.addColorStop(1, adjustColor(this.color, -0.38));
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

      // A. Real Slime Subsurface Scattering Rim Glow (translucent jelly edge)
      const innerGlow = ctx.createRadialGradient(this.cx, this.cy, this.baseRadius * 0.35, this.cx, this.cy, maxDist);
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
      innerGlow.addColorStop(0.78, 'rgba(255, 255, 255, 0)');
      innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0.30)');
      ctx.fillStyle = innerGlow;
      ctx.fillRect(this.cx - maxDist, this.cy - maxDist, maxDist * 2, maxDist * 2);

      // B. Suspended Micro-Air Bubbles (Authentic real slime texture detail!)
      const isPulling = this.isDragging && this.stretchDistance > 30;
      const pullDirX = isPulling ? (this.dragSmoothX - this.cx) / this.stretchDistance : 0;
      const pullDirY = isPulling ? (this.dragSmoothY - this.cy) / this.stretchDistance : 0;

      this.microBubbles.forEach(b => {
        let mx = this.cx + Math.cos(b.ang) * (this.baseRadius * b.distRatio * (1 + this.meltProgress * 0.38));
        let my = this.cy + Math.sin(b.ang) * (this.baseRadius * b.distRatio * (1 - this.meltProgress * 0.18));

        if (isPulling) {
          const dot = Math.cos(b.ang) * pullDirX + Math.sin(b.ang) * pullDirY;
          if (dot > 0.4) {
            const pullAmt = Math.pow(dot, 2) * (this.stretchDistance * 0.65) * b.distRatio;
            mx += pullDirX * pullAmt;
            my += pullDirY * pullAmt;
          }
        }

        // Translucent bubble body
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.45})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${b.alpha * 0.18})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(mx, my, b.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pinpoint specular glint
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(mx - b.size * 0.35, my - b.size * 0.35, b.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      // C. Crunchy Bingsu 🍧 Texture: Iridescent faceted beads with rainbow crystal glints!
      if (this.texture === 'crunchy') {
        this.bingsuBeads.forEach(b => {
          let bx = this.cx + Math.cos(b.ang) * (this.baseRadius * b.distRatio * (1 + this.meltProgress * 0.35));
          let by = this.cy + Math.sin(b.ang) * (this.baseRadius * b.distRatio * (1 - this.meltProgress * 0.18));

          if (isPulling) {
            const dot = Math.cos(b.ang) * pullDirX + Math.sin(b.ang) * pullDirY;
            if (dot > 0.4) {
              const pullAmt = Math.pow(dot, 2) * (this.stretchDistance * 0.72) * b.distRatio;
              bx += pullDirX * pullAmt;
              by += pullDirY * pullAmt;
            }
          }

          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(b.rot);

          // Translucent iridescent faceted bead tile
          ctx.fillStyle = b.color;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.lineWidth = 1.0;
          ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
          ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);

          // Facet reflection line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-b.w / 2, -b.h / 2);
          ctx.lineTo(b.w / 2, b.h / 2);
          ctx.stroke();

          // Sparkle glint on bead corner
          const pulse = (Math.sin(this.idlePhase * 3 + b.shimmer) + 1) * 0.5;
          if (pulse > 0.65) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-b.w / 2 + 1, -b.h / 2 + 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        });
      }

      // Cloud Slime ☁️: Fluffy cumulus layered puffs
      else if (this.texture === 'cloud') {
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
        this.foamBeads.forEach(b => {
          let bx = this.cx + Math.cos(b.ang) * (this.baseRadius * b.distRatio * (1 + this.meltProgress * 0.35));
          let by = this.cy + Math.sin(b.ang) * (this.baseRadius * b.distRatio * (1 - this.meltProgress * 0.18));

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
        this.glitterStars.forEach(s => {
          let sx = this.cx + Math.cos(s.ang) * (this.baseRadius * s.distRatio * (1 + this.meltProgress * 0.35));
          let sy = this.cy + Math.sin(s.ang) * (this.baseRadius * s.distRatio * (1 - this.meltProgress * 0.18));

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

      // 6. Wet High-Gloss Specular Sheen (Real liquid shine arc, adapts when flat)
      ctx.save();
      const shineAlpha = 0.85 - this.meltProgress * 0.2;
      ctx.strokeStyle = `rgba(255, 255, 255, ${shineAlpha})`;
      ctx.lineWidth = Math.max(4.0, 7.0 - this.meltProgress * 2.0);
      ctx.lineCap = 'round';
      ctx.beginPath();
      const shineRx = this.baseRadius * (0.78 + this.meltProgress * 0.35);
      const shineRy = this.baseRadius * (0.62 - this.meltProgress * 0.18);
      ctx.ellipse(this.cx, this.cy - this.baseRadius * (0.12 - this.meltProgress * 0.05), shineRx, Math.max(8, shineRy), 0, Math.PI * 1.15, Math.PI * 1.45);
      ctx.stroke();

      // Secondary specular dot
      ctx.fillStyle = `rgba(255, 255, 255, ${shineAlpha})`;
      ctx.beginPath();
      const dotX = this.cx - this.baseRadius * (0.55 + this.meltProgress * 0.22);
      const dotY = this.cy - this.baseRadius * (0.48 - this.meltProgress * 0.15);
      ctx.arc(dotX, dotY, Math.max(3, 6 - this.meltProgress * 1.5), 0, Math.PI * 2);
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
      this.floatingToolbar = document.getElementById('floatingToolbar');
      this.slimeHudPill = document.getElementById('slimeHudPill');

      const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
      if (isTouch && this.hudActionFeedback) {
        this.hudActionFeedback.textContent = '👆 Tap to squish · 🖐️ Drag to stretch · 🍯 Hold to stick!';
      }
    }

    bindEventListeners() {
      // Audio unlock on user touch/click
      ['click', 'touchstart', 'mousedown'].forEach(evt => {
        window.addEventListener(evt, () => {
          if (window.slimeAudio) window.slimeAudio.init();
        }, { once: true, passive: true });
      });

      // Canvas Pointer Coordinate Mapping (Safe for mouse & touch with ended touches)
      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const t = (e.touches && e.touches.length > 0)
          ? e.touches[0]
          : (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : e);
        const clientX = t ? t.clientX : (rect.left + rect.width / 2);
        const clientY = t ? t.clientY : (rect.top + rect.height / 2);
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
        this.pointerStartX = pos.x;
        this.pointerStartY = pos.y;
        this.pointerStartTime = performance.now();
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

      // Mobile Touch Handlers (Fluid touch tracking across window)
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const pos = getPos(e);
        this.pointerStartX = pos.x;
        this.pointerStartY = pos.y;
        this.pointerStartTime = performance.now();
        this.handlePointerDown(pos.x, pos.y);
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!this.mouse.isDown) return;
        const pos = getPos(e);
        this.handlePointerMove(pos.x, pos.y);
      }, { passive: false });

      window.addEventListener('touchend', (e) => {
        if (this.mouse.isDown) {
          const pos = getPos(e);
          this.mouse.x = pos.x;
          this.mouse.y = pos.y;
          this.handlePointerUp();
        }
      }, { passive: false });

      window.addEventListener('touchcancel', () => {
        if (this.mouse.isDown) {
          this.handlePointerUp();
        }
      }, { passive: true });

      // Stop touch event propagation on toolbar and HUD so tapping controls doesn't poke slime underneath
      if (this.floatingToolbar) {
        ['touchstart', 'touchmove', 'touchend'].forEach(evt => {
          this.floatingToolbar.addEventListener(evt, (e) => e.stopPropagation(), { passive: true });
        });
      }
      if (this.slimeHudPill) {
        ['touchstart', 'touchmove', 'touchend'].forEach(evt => {
          this.slimeHudPill.addEventListener(evt, (e) => e.stopPropagation(), { passive: true });
        });
      }

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
            if (this.slime.texture === 'crunchy') {
              window.slimeAudio.playBingsuCrunch();
            } else if (this.slime.texture === 'cloud') {
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
          if (window.slimeAudio) {
            if (this.slime.texture === 'crunchy') window.slimeAudio.playBingsuCrunch();
            else window.slimeAudio.playASMRSquish(this.slime.stickiness);
          }
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

      const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
      const defaultFeedback = isTouch
        ? '👆 Tap to squish · 🖐️ Drag to stretch · 🍯 Hold to stick!'
        : '🖐️ Hover to stick · Click to squish · Drag to stretch!';

      if (this.mouse.isDown) {
        const moveDist = Math.hypot(x - (this.pointerStartX || x), y - (this.pointerStartY || y));
        const holdTime = performance.now() - (this.pointerStartTime || 0);

        // Touch hold or mouse hold: finger stays in one place on the slime -> gooey adhesion!
        if (moveDist < 16 && holdTime > 120 && this.slime.containsPoint(x, y)) {
          this.isTouchHolding = true;
          const unstickEvent = this.slime.updateHover(x, y, 0.016, window.slimeAudio);
          if (unstickEvent) {
            this.spawnUnstickParticles(unstickEvent.x, unstickEvent.y);
            this.addCoins(2, unstickEvent.x, unstickEvent.y, '+2 🪙');
            if (this.hudActionFeedback) {
              this.hudActionFeedback.textContent = `🍯 Unstuck! (Level ${unstickEvent.stickiness} release pop)`;
              setTimeout(() => {
                if (this.hudActionFeedback) this.hudActionFeedback.textContent = defaultFeedback;
              }, 1200);
            }
          }
        } else if (this.slime.isDragging) {
          this.isTouchHolding = false;
          // ➰ Dragging stretches putty outward!
          this.slime.updateDrag(x, y);
          if (window.slimeAudio && Math.random() < 0.16) {
            if (this.slime.texture === 'crunchy') {
              window.slimeAudio.playBingsuCrunch();
            } else {
              window.slimeAudio.playStretch(1.0);
            }
          }
        }
      } else {
        // 🖐️ Hovering without clicking: Soft-Body Hover Adhesion
        const unstickEvent = this.slime.updateHover(x, y, 0.016, window.slimeAudio);
        if (unstickEvent) {
          this.spawnUnstickParticles(unstickEvent.x, unstickEvent.y);
          this.addCoins(2, unstickEvent.x, unstickEvent.y, '+2 🪙');
          if (this.hudActionFeedback) {
            this.hudActionFeedback.textContent = `🍯 Unstuck! (Level ${unstickEvent.stickiness} release pop)`;
            setTimeout(() => {
              if (this.hudActionFeedback) this.hudActionFeedback.textContent = defaultFeedback;
            }, 1200);
          }
        }
      }
    }

    handlePointerUp() {
      if (this.mouse.isDown) {
        this.mouse.isDown = false;
        if (this.isTouchHolding && this.slime.isHoverStuck) {
          // Touch release during gooey hold
          this.slime.isHoverStuck = false;
          this.slime.hoverCooldown = 0.35;
          this.spawnUnstickParticles(this.mouse.x, this.mouse.y);
          this.addCoins(2, this.mouse.x, this.mouse.y, '+2 🪙');
          if (window.slimeAudio) {
            window.slimeAudio.playStickRelease(this.slime.stickiness);
          }
        } else if (this.slime.isDragging) {
          // Snap back putty stretch!
          this.slime.endDrag();
          this.statStretches++;
          this.updateStats();
          this.addCoins(3, this.mouse.x, this.mouse.y, '+3 🪙');

          if (window.slimeAudio) {
            if (this.slime.texture === 'crunchy') {
              window.slimeAudio.playBingsuCrunch();
            } else {
              window.slimeAudio.playStickRelease(this.slime.stickiness);
            }
          }
        }
        this.isTouchHolding = false;
      }
    }

    popBubble(idx) {
      const b = this.bubbles[idx];
      this.bubbles.splice(idx, 1);

      // Bubble pop particles
      for (let i = 0; i < 10; i++) {
        this.particles.push(new Particle(b.x, b.y, 'rgba(255, 255, 255, 0.9)', 3, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 0.5, true));
      }

      if (window.slimeAudio) window.slimeAudio.playBubblePop();
      this.addCoins(5, b.x, b.y, '+5 🪙');
    }

    spawnSquishParticles(x, y) {
      const count = (this.slime.texture === 'floam' || this.slime.texture === 'crunchy') ? 12 : 8;
      for (let i = 0; i < count; i++) {
        let col = this.slime.color;
        if (this.slime.texture === 'cloud') {
          col = 'rgba(255, 255, 255, 0.85)';
        } else if (this.slime.texture === 'floam') {
          const beadCols = ['#ffffff', '#ff99c8', '#70e000', '#ffd166', '#00f5d4'];
          col = beadCols[i % beadCols.length];
        } else if (this.slime.texture === 'crunchy') {
          const bingsuCols = ['#ffffff', '#ffc6ff', '#bdb2ff', '#9bf6ff', '#ffd166'];
          col = bingsuCols[i % bingsuCols.length];
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
      this.soundToggleBtn.innerHTML = isMuted ? '🔇 <span class="btn-text">Sound: OFF</span>' : '🔊 <span class="btn-text">Sound: ON</span>';
      this.soundToggleBtn.classList.toggle('muted', isMuted);
    }

    // Responsive Canvas Screen Warper (Adapts seamlessly to Portrait mobile & Landscape desktop)
    warpGameToScreen() {
      if (!this.canvasStage || !this.canvasWrapper) return;
      const availableW = this.canvasStage.clientWidth;
      const availableH = this.canvasStage.clientHeight;
      if (availableW <= 0 || availableH <= 0) return;

      // On portrait mobile/tablet, availableH is significantly greater than availableW.
      // Use an upright aspect ratio (640x800, 4:5) so the slime gets full vertical room!
      const isPortrait = availableH > availableW * 1.05;
      const targetCanvasW = isPortrait ? 640 : 960;
      const targetCanvasH = isPortrait ? 800 : 540;
      const targetRatio = targetCanvasW / targetCanvasH;

      let w = availableW;
      let h = w / targetRatio;

      if (h > availableH) {
        h = availableH;
        w = h * targetRatio;
      }

      this.canvasWrapper.style.width = `${Math.floor(w)}px`;
      this.canvasWrapper.style.height = `${Math.floor(h)}px`;

      // Update internal canvas resolution and slime center on orientation switch
      if (this.canvas.width !== targetCanvasW || this.canvas.height !== targetCanvasH) {
        this.canvas.width = targetCanvasW;
        this.canvas.height = targetCanvasH;
        this.slime.cx = targetCanvasW / 2;
        this.slime.cy = targetCanvasH / 2;
        this.slime.baseRadius = isPortrait ? 150 : 135;
        this.slime.resetShape();
      }
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
              else if (t.id === 'crunchy') window.slimeAudio.playBingsuCrunch();
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
        } else if (curTex === 'crunchy') {
          const bingsuHues = ['#ff70a6', '#ffd670', '#70d6ff', '#ff9770', '#e9ff70', '#ffffff'];
          [[-22, -12], [-10, -22], [8, -20], [20, -10], [-2, -14], [14, -6], [-14, -4]].forEach(([ox, oy], i) => {
            ctx.save();
            ctx.translate(bowlX + ox, bowlY + oy);
            ctx.rotate((i * 45) * Math.PI / 180);
            ctx.fillStyle = bingsuHues[i % bingsuHues.length];
            ctx.fillRect(-3.5, -2, 7, 4);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-3.5, -2, 7, 4);
            ctx.restore();
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
              this.slime.setTexture(t.id);
              this.initTextureShop();
              this.initSlimeMakerForm();
              this.updateHeaderProfile();
              if (window.slimeAudio) {
                if (t.id === 'cloud') window.slimeAudio.playCloudPuff();
                else if (t.id === 'floam') window.slimeAudio.playFoamCrunch();
                else if (t.id === 'crunchy') window.slimeAudio.playBingsuCrunch();
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
              this.slime.setTexture(t.id);
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
      } else if (t.id === 'crunchy') {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, '#ffc6ff');
        grad.addColorStop(0.7, '#bdb2ff');
        grad.addColorStop(1, '#70d6ff');
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
      } else if (t.id === 'crunchy') {
        const bColors = ['#ff70a6', '#ffd670', '#70d6ff', '#e9ff70', '#ffffff'];
        [[-16, -12, 0.2], [-6, -22, -0.4], [8, -18, 0.6], [16, -10, -0.2], [-2, -10, 0.3], [10, -6, -0.5]].forEach(([bx, by, rot], i) => {
          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(rot);
          ctx.fillStyle = bColors[i % bColors.length];
          ctx.fillRect(-3.2, -2, 6.4, 4);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(-3.2, -2, 6.4, 4);
          ctx.restore();
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
      const cw = this.canvas.width;
      const ch = this.canvas.height;
      ctx.clearRect(0, 0, cw, ch);

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
      const cw = this.canvas.width;
      const ch = this.canvas.height;
      const cx = cw / 2;
      const cy = ch / 2;

      // Tabletop gradient (clean modern marble / pastel studio look)
      const bgGrad = ctx.createRadialGradient(
        cx, cy, 80,
        cx, cy, Math.max(cw, ch) * 0.65
      );
      bgGrad.addColorStop(0, '#1c314a');
      bgGrad.addColorStop(0.6, '#0f2038');
      bgGrad.addColorStop(1, '#081424');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, cw, ch);

      // Concentric circular play mat rings beneath slime
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(cx, cy, this.slime.baseRadius * 1.35, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, this.slime.baseRadius * 1.68, 0, Math.PI * 2);
      ctx.stroke();

      // Subtle table grid texture lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 60; x < cw; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch);
        ctx.stroke();
      }
      for (let y = 60; y < ch; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cw, y);
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
