/**
 * Slime Arcade - Core Game Engine
 * Soft-body jelly physics, volleyball & soccer modes, smart AI bot,
 * 2-player local mode, super moves, particle fx, and auto-warping canvas.
 */

(function () {
  'use strict';

  // --- Constants ---
  const CANVAS_WIDTH = 960;
  const CANVAS_HEIGHT = 540;
  const FLOOR_Y = 480;
  const GRAVITY = 0.52;
  const WINNING_SCORE = 7;

  // Slime Roster Catalog
  const SLIMES = {
    goopy: {
      id: 'goopy',
      name: 'Goopy Green',
      color: '#38b000',
      grad: ['#9ef01a', '#70e000', '#38b000', '#007200'],
      glow: '#70e000',
      powerName: 'Acid Spike',
      powerDesc: 'Spikes the ball with high velocity acid trail!',
      avatar: '🟢'
    },
    bubblegum: {
      id: 'bubblegum',
      name: 'Bubblegum',
      color: '#ff007f',
      grad: ['#ff99c8', '#ff70a6', '#ff007f', '#a00050'],
      glow: '#ff70a6',
      powerName: 'Bubble Shield',
      powerDesc: 'Launches a high-bounce protective bubble!',
      avatar: '🩷'
    },
    magma: {
      id: 'magma',
      name: 'Magma Blaze',
      color: '#e63946',
      grad: ['#ffbe0b', '#fb5607', '#ff0054', '#800f2f'],
      glow: '#fb5607',
      powerName: 'Meteor Smash',
      powerDesc: 'Slams a fiery meteor strike towards opponent court!',
      avatar: '🔥'
    },
    neon: {
      id: 'neon',
      name: 'Neon Cyan',
      color: '#00f5d4',
      grad: ['#e0fbfc', '#00f5d4', '#00bbf9', '#0077b6'],
      glow: '#00f5d4',
      powerName: 'Warp Dash',
      powerDesc: 'Instantly dashes across court with electric speed!',
      avatar: '⚡'
    },
    golden: {
      id: 'golden',
      name: 'Golden King',
      color: '#ffd166',
      grad: ['#fff3b0', '#ffe66d', '#ffd166', '#d4a373'],
      glow: '#ffd166',
      powerName: 'Royal Shockwave',
      powerDesc: 'Sends a golden shockwave that destabilizes the ball!',
      avatar: '👑'
    },
    cosmic: {
      id: 'cosmic',
      name: 'Cosmic Void',
      color: '#7b2cbf',
      grad: ['#e0aaff', '#c77dff', '#9d4edd', '#3c096c'],
      glow: '#c77dff',
      powerName: 'Gravity Warp',
      powerDesc: 'Curving cosmic gravity trajectory on the ball!',
      avatar: '🌌'
    },
    mint: {
      id: 'mint',
      name: 'Mint Frost',
      color: '#52b788',
      grad: ['#d8f3dc', '#b7e4c7', '#74c69d', '#2d6a4f'],
      glow: '#74c69d',
      powerName: 'Ice Frost',
      powerDesc: 'Chills the opponent paddle with a frost blast!',
      avatar: '❄️'
    },
    toxic: {
      id: 'toxic',
      name: 'Toxic Sludge',
      color: '#9b5de5',
      grad: ['#f15bb5', '#9b5de5', '#5a189a', '#240046'],
      glow: '#9b5de5',
      powerName: 'Sludge Bomb',
      powerDesc: 'Heavy unpredictable squishy bounce!',
      avatar: '🧪'
    }
  };

  // Slime Textures Catalog (Cloud, Floam, Butter, Glitter, Crystal, Gold)
  const SLIME_TEXTURES = {
    classic: {
      id: 'classic',
      name: 'Classic Jelly',
      price: 0,
      icon: '🟢',
      tagline: 'Standard glossy bounce',
      desc: 'The original translucent jelly slime. Balanced bounce and smooth sheen.'
    },
    cloud: {
      id: 'cloud',
      name: 'Cloud Slime ☁️',
      price: 150,
      icon: '☁️',
      tagline: 'Airy, drizzly & floaty',
      desc: 'Fluffy drizzling cotton texture! Floats softly with +15% hangtime and soft ASMR puffs.'
    },
    floam: {
      id: 'floam',
      name: 'Floam Crunch 🍡',
      price: 180,
      icon: '🍡',
      tagline: 'Crunchy micro-foam beads',
      desc: 'Packed with thousands of colorful crunchy foam beads. Satisfying ASMR pops on every hit!'
    },
    butter: {
      id: 'butter',
      name: 'Butter Slime 🧈',
      price: 220,
      icon: '🧈',
      tagline: 'Super smooth & spreadable',
      desc: 'Clay-infused velvety matte slime. Cushions hard shots and gives supreme landing balance.'
    },
    glitter: {
      id: 'glitter',
      name: 'Glitter Galaxy ✨',
      price: 250,
      icon: '✨',
      tagline: 'Dazzling star sparkle',
      desc: 'Infused with holographic stars that shimmer and leave sparkling cosmic trails.'
    },
    crystal: {
      id: 'crystal',
      name: 'Crystal Clear 💎',
      price: 300,
      icon: '💎',
      tagline: 'Pure glass refraction',
      desc: 'Ultra clear optical glass texture with brilliant light prisms and snappy ball release.'
    },
    gold: {
      id: 'gold',
      name: 'Golden Chrome 👑',
      price: 500,
      icon: '👑',
      tagline: 'Molten liquid 24K gold',
      desc: 'Pure royal metallic chrome reflection. Drips golden sparkles on every spike!'
    }
  };

  // Preset Colors for Slime Maker Palette
  const PRESET_COLORS = [
    { name: 'Neon Lime', hex: '#38b000' },
    { name: 'Electric Cyan', hex: '#00f5d4' },
    { name: 'Bubble Pink', hex: '#ff007f' },
    { name: 'Sunburst Orange', hex: '#fb5607' },
    { name: 'Sunshine Yellow', hex: '#ffd166' },
    { name: 'Cosmic Purple', hex: '#9b5de5' },
    { name: 'Mint Frost', hex: '#52b788' },
    { name: 'Ruby Blaze', hex: '#e63946' },
    { name: 'Deep Royal', hex: '#3a86ff' },
    { name: 'Pastel Lavender', hex: '#c77dff' }
  ];

  // Stickiness Traits & Descriptions (1 to 5)
  const STICKINESS_TRAITS = {
    1: { name: 'Level 1: Ultra Slick', restitution: 1.16, desc: 'Super slick and springy! Ball shoots off fast with high rebound velocity.' },
    2: { name: 'Level 2: Light Gloss', restitution: 1.11, desc: 'Crisp and snappy with light surface grip. Snappy response on spikes.' },
    3: { name: 'Level 3: Balanced', restitution: 1.06, desc: 'Balanced grip & bounce. Great all-around feel for rallies and spikes.' },
    4: { name: 'Level 4: Gooey Cushion', restitution: 0.98, desc: 'Gooey cushion absorbs heavy opponent spikes and gives precise directional control.' },
    5: { name: 'Level 5: Super Sticky', restitution: 0.91, desc: 'Ultra sticky taffy! Drastically slows fast spikes and leaves goo string drip trails.' }
  };

  // Color Utility Helpers for Custom Slimes
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
      adjustColor(baseHex, 0.25), // Midtone light
      baseHex,                    // Base color
      adjustColor(baseHex, -0.45) // Shadow
    ];
  }

  // --- Particle System ---
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
      if (this.hasGravity) this.vy += GRAVITY * dt * 30;
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

  // --- Confetti Particle System ---
  class Confetti {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff', '#00f5d4'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.w = 6 + Math.random() * 6;
      this.h = 4 + Math.random() * 4;
      this.vx = (Math.random() - 0.5) * 12;
      this.vy = -6 - Math.random() * 10;
      this.rot = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 12;
      this.life = 2.0;
    }

    update(dt) {
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      this.vy += GRAVITY * 0.45 * dt * 60;
      this.rot += this.rotSpeed * dt;
      this.life -= dt * 0.5;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    }
  }

  // --- Ball Class ---
  class Ball {
    constructor(mode = 'volleyball') {
      this.radius = 22;
      this.mode = mode;
      this.reset('left');
    }

    reset(servingSide = 'left') {
      this.x = servingSide === 'left' ? 240 : 720;
      this.y = 220;
      this.vx = servingSide === 'left' ? 2.5 : -2.5;
      this.vy = -3;
      this.rot = 0;
      this.rotSpeed = 0;
      this.isSuper = false;
      this.superColor = '#fff';
      this.trail = [];
    }

    update(dt) {
      // Trail
      this.trail.push({ x: this.x, y: this.y, alpha: 1.0 });
      if (this.trail.length > 8) this.trail.shift();

      // Physics
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      this.vy += GRAVITY * dt * 60;

      // Rotation based on horizontal velocity
      this.rot += (this.vx * 0.05 + this.rotSpeed) * dt * 60;
      this.rotSpeed *= 0.98;

      // Speed limits
      const maxSpd = this.isSuper ? 24 : 18;
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > maxSpd) {
        this.vx = (this.vx / speed) * maxSpd;
        this.vy = (this.vy / speed) * maxSpd;
      }
    }

    draw(ctx) {
      // Draw Trail
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const a = (i / this.trail.length) * 0.35;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = this.isSuper ? this.superColor : 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(t.x, t.y, this.radius * (0.4 + 0.6 * (i / this.trail.length)), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Drop Shadow on Floor
      const shadowY = FLOOR_Y;
      const distFromFloor = Math.max(0, FLOOR_Y - this.y);
      const shadowAlpha = Math.max(0.1, 0.45 - distFromFloor / 500);
      const shadowScale = Math.max(0.3, 1 - distFromFloor / 600);

      ctx.save();
      ctx.globalAlpha = shadowAlpha;
      ctx.fillStyle = '#0a1d37';
      ctx.beginPath();
      ctx.ellipse(this.x, shadowY + 2, this.radius * shadowScale * 1.3, this.radius * 0.35 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ball Body
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);

      if (this.mode === 'volleyball') {
        this.drawVolleyball(ctx);
      } else {
        this.drawSoccerBall(ctx);
      }

      // Outer outline & specular shine
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#2b1e10';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Super power glow
      if (this.isSuper) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.superColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    drawVolleyball(ctx) {
      // Classic Volleyball 3-color curved stripes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Blue & Yellow curved panels
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#0077b6';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI);
      ctx.stroke();

      ctx.strokeStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.7, Math.PI, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-this.radius, 0);
      ctx.lineTo(this.radius, 0);
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(0, this.radius);
      ctx.stroke();
    }

    drawSoccerBall(ctx) {
      // Classic Black & White Soccer Ball
      ctx.fillStyle = '#f8f9fa';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Center Pentagon
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = Math.cos(a) * (this.radius * 0.42);
        const py = Math.sin(a) * (this.radius * 0.42);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Spokes to outer patches
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#1e293b';
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = Math.cos(a) * (this.radius * 0.42);
        const py = Math.sin(a) * (this.radius * 0.42);
        const ox = Math.cos(a) * this.radius;
        const oy = Math.sin(a) * this.radius;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(ox, oy);
        ctx.stroke();
      }
    }
  }

  // --- Slime Character Class (Soft-Body Squishy Physics) ---
  class Slime {
    constructor(x, side = 'left', skinId = 'goopy') {
      this.baseRadius = 55;
      this.radius = 55;
      this.x = x;
      this.y = FLOOR_Y;
      this.vx = 0;
      this.vy = 0;
      this.side = side; // 'left' or 'right'
      this.skin = SLIMES[skinId] || SLIMES.goopy;
      this.isGrounded = true;
      this.speed = 7.5;
      this.jumpForce = 13.5;

      // Soft-body deformation springs
      this.scaleX = 1.0;
      this.scaleY = 1.0;
      this.targetScaleX = 1.0;
      this.targetScaleY = 1.0;
      this.wobblePhase = Math.random() * Math.PI * 2;
      this.wobbleAmp = 0;

      // Eye tracking & Blinking
      this.eyeBlink = 0;
      this.eyeLookX = 0;
      this.eyeLookY = 0;
      this.nextBlinkTimer = 2 + Math.random() * 3;

      // Super power meter (0 to 100)
      this.superMeter = 0;
      this.isDashing = false;
      this.dashTimer = 0;

      // Custom Slime Properties (Slime Maker & Textures)
      this.isCustom = false;
      this.customColor = '#38b000';
      this.stickiness = 3; // 1 to 5
      this.texture = 'classic';
      this.customGrad = null;
      this.ambientTimer = 0;
    }

    setSkin(skinId) {
      this.isCustom = false;
      if (SLIMES[skinId]) {
        this.skin = SLIMES[skinId];
      }
    }

    applyCustomConfig(cfg) {
      this.isCustom = true;
      if (cfg.color) this.customColor = cfg.color;
      if (cfg.stickiness !== undefined) this.stickiness = parseInt(cfg.stickiness, 10);
      if (cfg.texture) this.texture = cfg.texture;
      this.customGrad = generateSlimeGradient(this.customColor);

      // Trait modifications
      if (this.texture === 'cloud') {
        this.jumpForce = 14.2;
      } else if (this.texture === 'butter') {
        this.jumpForce = 13.0;
      } else {
        this.jumpForce = 13.5;
      }
    }

    jump() {
      if (this.isGrounded) {
        this.vy = -this.jumpForce;
        this.isGrounded = false;
        // Stretch vertically when jumping
        this.scaleY = 1.35;
        this.scaleX = 0.78;
        if (window.slimeAudio) {
          if (this.isCustom && this.texture === 'cloud') {
            window.slimeAudio.playCloudPuff();
          } else {
            window.slimeAudio.playJump();
          }
        }
      }
    }

    triggerWobble(amount = 0.35) {
      this.wobbleAmp = amount;
      this.scaleY = 0.7;
      this.scaleX = 1.3;
    }

    update(dt, ball, netX, courtWidth) {
      // Horizontal Movement
      this.x += this.vx * dt * 60;

      // Court Boundaries
      const r = this.radius;
      if (this.side === 'left') {
        if (this.x - r < 10) this.x = 10 + r;
        if (this.x + r > netX - 6) this.x = netX - 6 - r;
      } else {
        if (this.x - r < netX + 6) this.x = netX + 6 + r;
        if (this.x + r > courtWidth - 10) this.x = courtWidth - 10 - r;
      }

      // Vertical Movement (Gravity & Jumping)
      this.y += this.vy * dt * 60;
      if (this.y < FLOOR_Y) {
        // Cloud Slime gets floaty hangtime (+18% hangtime)
        const curGravity = (this.isCustom && this.texture === 'cloud') ? GRAVITY * 0.82 : GRAVITY;
        this.vy += curGravity * dt * 60;
        this.isGrounded = false;
      } else {
        if (!this.isGrounded) {
          // Landing squish impact!
          this.scaleY = 0.72;
          this.scaleX = 1.28;
          this.wobbleAmp = 0.25;
        }
        this.y = FLOOR_Y;
        this.vy = 0;
        this.isGrounded = true;
      }

      // Soft-body Spring Damper (Restores normal shape smoothly)
      this.scaleX += (this.targetScaleX - this.scaleX) * 0.18;
      this.scaleY += (this.targetScaleY - this.scaleY) * 0.18;

      // Ambient idle breathing wobble
      this.wobblePhase += dt * 5;
      const idleWobble = Math.sin(this.wobblePhase) * 0.03;
      this.targetScaleX = 1.0 + idleWobble + (this.wobbleAmp ? Math.sin(this.wobblePhase * 3) * this.wobbleAmp : 0);
      this.targetScaleY = 1.0 - idleWobble - (this.wobbleAmp ? Math.sin(this.wobblePhase * 3) * this.wobbleAmp : 0);
      this.wobbleAmp *= 0.92;

      // Eye Tracking Ball
      const edx = ball.x - (this.x + (this.side === 'left' ? 18 : -18));
      const edy = ball.y - (this.y - 25);
      const edist = Math.hypot(edx, edy) || 1;
      this.eyeLookX = (edx / edist) * 5;
      this.eyeLookY = (edy / edist) * 4;

      // Blinking
      this.nextBlinkTimer -= dt;
      if (this.nextBlinkTimer <= 0) {
        this.eyeBlink = 1.0;
        this.nextBlinkTimer = 2.5 + Math.random() * 3.5;
      }
      if (this.eyeBlink > 0) {
        this.eyeBlink -= dt * 6;
      }

      // Dash Timer
      if (this.isDashing) {
        this.dashTimer -= dt;
        if (this.dashTimer <= 0) {
          this.isDashing = false;
          this.vx = 0;
        }
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Floor Shadow
      ctx.fillStyle = 'rgba(10, 25, 47, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 1.15 * this.scaleX, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slime Jelly Dome Geometry (Scaled by soft-body deformation)
      ctx.scale(this.scaleX, this.scaleY);

      // Gradient Fill (Custom or Catalog)
      const grad = ctx.createRadialGradient(-15, -30, 8, 0, 0, this.radius);
      if (this.isCustom) {
        if (this.texture === 'gold') {
          grad.addColorStop(0, '#fffbe0');
          grad.addColorStop(0.35, '#ffd700');
          grad.addColorStop(0.5, '#cca000');
          grad.addColorStop(0.52, '#fff3a8');
          grad.addColorStop(0.75, '#b8860b');
          grad.addColorStop(1, '#5c4308');
        } else if (this.texture === 'crystal') {
          grad.addColorStop(0, adjustColor(this.customColor, 0.65));
          grad.addColorStop(0.35, adjustColor(this.customColor, 0.25));
          grad.addColorStop(0.75, this.customColor);
          grad.addColorStop(1, adjustColor(this.customColor, -0.2));
        } else {
          const cGrad = this.customGrad || generateSlimeGradient(this.customColor);
          grad.addColorStop(0, cGrad[0]);
          grad.addColorStop(0.3, cGrad[1]);
          grad.addColorStop(0.7, cGrad[2]);
          grad.addColorStop(1, cGrad[3]);
        }
      } else {
        grad.addColorStop(0, this.skin.grad[0]);
        grad.addColorStop(0.3, this.skin.grad[1]);
        grad.addColorStop(0.7, this.skin.grad[2]);
        grad.addColorStop(1, this.skin.grad[3]);
      }

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#1e1e24';
      ctx.lineWidth = 3.2;

      // Draw Slime Dome (Slightly curved bottom for natural jelly feel)
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, Math.PI, 0, false);
      ctx.quadraticCurveTo(0, 4, -this.radius, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Texture Visual Overlays
      if (this.isCustom) {
        if (this.texture === 'cloud') {
          // Cloud Slime ☁️: Fluffy cumulus cloud puffs overlapping on the top surface
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
          ctx.beginPath();
          ctx.arc(-26, -24, 18, 0, Math.PI * 2);
          ctx.arc(-8, -38, 20, 0, Math.PI * 2);
          ctx.arc(14, -36, 19, 0, Math.PI * 2);
          ctx.arc(30, -22, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.beginPath();
          ctx.arc(-10, -18, 22, 0, Math.PI * 2);
          ctx.arc(10, -18, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (this.texture === 'floam') {
          // Floam Slime 🍡: Colorful micro-foam beads suspended in jelly body
          ctx.save();
          const beadColors = ['#ffffff', '#ff99c8', '#70e000', '#ffd166', '#00f5d4', '#ff70a6'];
          const beadPositions = [
            [-32, -14, 5.5, 0], [-20, -28, 6.0, 1], [-12, -12, 5.0, 2], [0, -32, 6.5, 3],
            [15, -26, 5.8, 4], [28, -14, 6.2, 5], [-24, -38, 5.2, 3], [8, -16, 5.4, 1],
            [-6, -42, 5.0, 2], [22, -38, 5.5, 0], [4, -40, 5.2, 4], [-36, -26, 4.8, 5]
          ];
          beadPositions.forEach(([bx, by, br, colIdx]) => {
            ctx.fillStyle = beadColors[colIdx % beadColors.length];
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(bx - br * 0.35, by - br * 0.35, br * 0.3, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        } else if (this.texture === 'butter') {
          // Butter Slime 🧈: Velvety smooth butter-knife swirl curve across dome
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-35, -16);
          ctx.bezierCurveTo(-15, -42, 10, -44, 34, -20);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-22, -10);
          ctx.bezierCurveTo(-6, -24, 12, -26, 26, -10);
          ctx.stroke();
          ctx.restore();
        } else if (this.texture === 'glitter') {
          // Glitter Slime ✨: Twinkling 4-point holographic star sparkles
          ctx.save();
          const starOffsets = [
            [-28, -25, 6, 0], [-10, -36, 7.5, 0.5], [16, -34, 6.5, 1.2],
            [26, -18, 5.5, 1.8], [-6, -18, 7, 2.3], [12, -12, 5, 3.1]
          ];
          starOffsets.forEach(([sx, sy, size, phase]) => {
            const pulse = (Math.sin(this.wobblePhase * 3 + phase) + 1) * 0.5;
            const curSize = size * (0.6 + pulse * 0.7);
            ctx.fillStyle = pulse > 0.6 ? '#ffffff' : '#ffe66d';
            ctx.beginPath();
            ctx.moveTo(sx, sy - curSize);
            ctx.quadraticCurveTo(sx, sy, sx + curSize, sy);
            ctx.quadraticCurveTo(sx, sy, sx, sy + curSize);
            ctx.quadraticCurveTo(sx, sy, sx - curSize, sy);
            ctx.quadraticCurveTo(sx, sy, sx, sy - curSize);
            ctx.fill();
          });
          ctx.restore();
        } else if (this.texture === 'crystal') {
          // Crystal Clear 💎: Optical glass refraction gleam & prism facet
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-32, -12);
          ctx.lineTo(-12, -42);
          ctx.lineTo(16, -42);
          ctx.lineTo(34, -12);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.fill();
          ctx.restore();
        } else if (this.texture === 'gold') {
          // Golden Chrome 👑: Metallic horizon reflection line & gold glints
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, this.radius * 0.5, Math.PI * 1.1, Math.PI * 1.5);
          ctx.stroke();
          ctx.restore();
        }

        // Stickiness Goo Drips (Level 4 & 5)
        if (this.stickiness >= 4) {
          ctx.save();
          ctx.fillStyle = this.customGrad ? this.customGrad[2] : this.customColor;
          ctx.strokeStyle = '#1e1e24';
          ctx.lineWidth = 2.0;
          const dripLen = this.stickiness === 5 ? 18 : 10;
          const dripPositions = [-28, -6, 18, 34];
          dripPositions.forEach((dx, i) => {
            const curDrip = dripLen + Math.sin(this.wobblePhase * 2 + i * 1.5) * 4;
            ctx.beginPath();
            ctx.moveTo(dx - 4, 0);
            ctx.quadraticCurveTo(dx - 4, curDrip * 0.7, dx, curDrip);
            ctx.quadraticCurveTo(dx + 4, curDrip * 0.7, dx + 4, 0);
            ctx.fill();
            ctx.stroke();
          });
          ctx.restore();
        }
      }

      // Curved Specular Gloss Highlight (Cartoon jelly shine)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const shineSide = this.side === 'left' ? -1 : 1;
      ctx.arc(0, 0, this.radius * 0.78, Math.PI * 1.15, Math.PI * 1.45);
      ctx.stroke();
      ctx.restore();

      // Expressive Eyes
      const eyeOffsetX = this.side === 'left' ? 20 : -20;
      const eyeOffsetY = -24;
      const eyeRadius = 9.5;

      ctx.save();
      ctx.translate(eyeOffsetX, eyeOffsetY);

      if (this.eyeBlink > 0.3) {
        // Blinking line
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-eyeRadius, 0);
        ctx.lineTo(eyeRadius, 0);
        ctx.stroke();
      } else {
        // Eye Sclera (White)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e1e24';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eye Pupil & Catchlight
        ctx.fillStyle = '#1e1e24';
        ctx.beginPath();
        ctx.arc(this.eyeLookX, this.eyeLookY, eyeRadius * 0.52, 0, Math.PI * 2);
        ctx.fill();

        // White specular reflection dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.eyeLookX - 2, this.eyeLookY - 2, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();
    }
  }

  // --- Main Game Engine Class ---
  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.canvasStage = document.getElementById('canvasStage');
      this.canvasWrapper = document.getElementById('canvasWrapper');

      // Mode & Config
      this.mode = 'volleyball'; // 'volleyball' or 'soccer'
      this.isTwoPlayer = false;
      this.difficulty = 'medium'; // 'easy', 'medium', 'hard'
      this.state = 'START'; // 'START', 'SERVING', 'PLAYING', 'SCORED', 'GAMEOVER', 'PAUSED'
      this.servingSide = 'left';

      // Scores & Rallies
      this.p1Score = 0;
      this.p2Score = 0;
      this.rally = 0;
      this.time = 0;

      // Currency & Custom Slime State
      this.coins = parseInt(localStorage.getItem('slime_coins') || '250', 10);
      try {
        this.unlockedTextures = JSON.parse(localStorage.getItem('slime_unlocked_textures') || '["classic"]');
      } catch (e) {
        this.unlockedTextures = ['classic'];
      }
      try {
        this.customSlimeData = JSON.parse(localStorage.getItem('slime_custom_data') || '{"color":"#38b000","stickiness":3,"texture":"classic","isEquipped":false}');
      } catch (e) {
        this.customSlimeData = { color: '#38b000', stickiness: 3, texture: 'classic', isEquipped: false };
      }

      this.makerColor = this.customSlimeData.color || '#38b000';
      this.makerStickiness = this.customSlimeData.stickiness || 3;
      this.makerTexture = this.customSlimeData.texture || 'classic';

      // Entities
      this.p1 = new Slime(200, 'left', 'goopy');
      this.p2 = new Slime(760, 'right', 'magma');
      this.ball = new Ball(this.mode);
      this.particles = [];
      this.confetti = [];

      // Apply custom slime if previously equipped
      if (this.customSlimeData && this.customSlimeData.isEquipped) {
        this.p1.applyCustomConfig(this.customSlimeData);
        const texObj = SLIME_TEXTURES[this.makerTexture];
        const p1AvatarEl = document.getElementById('p1Avatar');
        if (p1AvatarEl) p1AvatarEl.textContent = texObj ? texObj.icon : '🧪';
      }

      // Net / Goal Dimensions
      this.netWidth = 14;
      this.netHeight = 140; // from floor
      this.netX = CANVAS_WIDTH / 2;

      // Input Keys
      this.keys = {
        w: false, a: false, d: false, space: false,
        arrowUp: false, arrowLeft: false, arrowRight: false, enter: false
      };

      // DOM UI Elements
      this.bindDOMElements();
      this.bindEventListeners();
      this.initSlimeCoins();
      this.initSlimeLab();
      this.buildSkinsGrid();

      // Screen Warper
      this.warpGameToScreen();
      window.addEventListener('resize', () => this.warpGameToScreen());
      window.addEventListener('orientationchange', () => setTimeout(() => this.warpGameToScreen(), 120));
      if (window.ResizeObserver && this.canvasStage) {
        new ResizeObserver(() => this.warpGameToScreen()).observe(this.canvasStage);
      }

      // Start loop
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    bindDOMElements() {
      this.modeBtn = document.getElementById('modeBtn');
      this.playersBtn = document.getElementById('playersBtn');
      this.diffContainer = document.getElementById('diffContainer');
      this.difficultySelect = document.getElementById('difficulty');
      this.skinsBtn = document.getElementById('skinsBtn');
      this.soundToggleBtn = document.getElementById('soundToggle');
      this.pauseBtn = document.getElementById('pauseBtn');
      this.restartBtn = document.getElementById('restartBtn');

      this.p1ScoreEl = document.getElementById('p1Score');
      this.p2ScoreEl = document.getElementById('p2Score');
      this.rallyCountEl = document.getElementById('rallyCount');
      this.modeBadgeEl = document.getElementById('modeBadge');
      this.p1PowerFillEl = document.getElementById('p1PowerFill');
      this.p2PowerFillEl = document.getElementById('p2PowerFill');
      this.p2NameEl = document.getElementById('p2Name');
      this.p2AvatarEl = document.getElementById('p2Avatar');

      this.overlay = document.getElementById('gameOverlay');
      this.overlayTitle = document.getElementById('overlayTitle');
      this.overlayMsg = document.getElementById('overlayMessage');
      this.overlayMascot = document.getElementById('overlayMascot');
      this.actionBtn = document.getElementById('actionBtn');

      this.skinsModal = document.getElementById('skinsModal');
      this.skinsGrid = document.getElementById('skinsGrid');
      this.closeSkinsBtn = document.getElementById('closeSkinsBtn');
      this.closeSkinsXBtn = document.getElementById('closeSkinsXBtn');

      // Slime Lab & Currency Elements
      this.coinsBadge = document.getElementById('coinsBadge');
      this.coinsVal = document.getElementById('coinsVal');
      this.labCoinsVal = document.getElementById('labCoinsVal');
      this.slimeMakerBtn = document.getElementById('slimeMakerBtn');
      this.slimeLabModal = document.getElementById('slimeLabModal');
      this.closeLabBtn = document.getElementById('closeLabBtn');
      this.closeLabXBtn = document.getElementById('closeLabXBtn');
      this.tabMakerBtn = document.getElementById('tabMakerBtn');
      this.tabTexturesBtn = document.getElementById('tabTexturesBtn');
      this.tabMakerContent = document.getElementById('tabMakerContent');
      this.tabTexturesContent = document.getElementById('tabTexturesContent');
      this.slimePreviewCanvas = document.getElementById('slimePreviewCanvas');
      this.activeTextureLabel = document.getElementById('activeTextureLabel');
      this.colorPalette = document.getElementById('colorPalette');
      this.customColorPicker = document.getElementById('customColorPicker');
      this.stickinessValueLabel = document.getElementById('stickinessValueLabel');
      this.stickinessSlider = document.getElementById('stickinessSlider');
      this.stickinessTraitDesc = document.getElementById('stickinessTraitDesc');
      this.equipCustomSlimeBtn = document.getElementById('equipCustomSlimeBtn');
      this.texturesGrid = document.getElementById('texturesGrid');
    }

    bindEventListeners() {
      // Audio unlock on user touch/click
      ['click', 'touchstart', 'keydown'].forEach(evt => {
        window.addEventListener(evt, () => {
          if (window.slimeAudio) window.slimeAudio.init();
        }, { once: true, passive: true });
      });

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }

        const k = e.key.toLowerCase();
        if (k === 'w') this.keys.w = true;
        if (k === 'a') this.keys.a = true;
        if (k === 'd') this.keys.d = true;
        if (e.code === 'Space') this.keys.space = true;

        if (e.code === 'ArrowUp') this.keys.arrowUp = true;
        if (e.code === 'ArrowLeft') this.keys.arrowLeft = true;
        if (e.code === 'ArrowRight') this.keys.arrowRight = true;
        if (e.code === 'Enter') this.keys.enter = true;

        if (k === 'p') this.togglePause();
        if (k === 'r') this.restartMatch();
        if (k === 'm') this.toggleSound();
        if (e.code === 'Escape') {
          this.closeSkinsModal();
          this.closeSlimeLab();
        }
      });

      window.addEventListener('keyup', (e) => {
        const k = e.key.toLowerCase();
        if (k === 'w') this.keys.w = false;
        if (k === 'a') this.keys.a = false;
        if (k === 'd') this.keys.d = false;
        if (e.code === 'Space') this.keys.space = false;

        if (e.code === 'ArrowUp') this.keys.arrowUp = false;
        if (e.code === 'ArrowLeft') this.keys.arrowLeft = false;
        if (e.code === 'ArrowRight') this.keys.arrowRight = false;
        if (e.code === 'Enter') this.keys.enter = false;
      });

      // Mobile Touch Controls
      this.bindTouchControls();

      // Action Button
      this.actionBtn.addEventListener('click', () => {
        if (this.state === 'START' || this.state === 'GAMEOVER') {
          this.startMatch();
        } else if (this.state === 'PAUSED') {
          this.togglePause();
        }
      });

      // Game Mode Toggle (Volleyball <-> Soccer)
      this.modeBtn.addEventListener('click', () => {
        this.mode = this.mode === 'volleyball' ? 'soccer' : 'volleyball';
        this.ball.mode = this.mode;
        this.modeBtn.textContent = this.mode === 'volleyball' ? '🏐 Volleyball' : '⚽ Soccer';
        this.modeBadgeEl.textContent = this.mode.toUpperCase();
        this.restartMatch();
      });

      // 1P vs 2P Local Toggle
      this.playersBtn.addEventListener('click', () => {
        this.isTwoPlayer = !this.isTwoPlayer;
        this.playersBtn.textContent = this.isTwoPlayer ? '👥 2P Local' : '👤 1P vs CPU';
        this.diffContainer.style.display = this.isTwoPlayer ? 'none' : 'flex';
        this.p2NameEl.textContent = this.isTwoPlayer ? 'Player 2' : 'Robo-Slime';
        this.p2AvatarEl.textContent = this.isTwoPlayer ? '🔴' : '🤖';
        this.restartMatch();
      });

      // Bot Difficulty Select
      this.difficultySelect.addEventListener('change', (e) => {
        this.difficulty = e.target.value;
      });

      // Sound Toggle
      this.soundToggleBtn.addEventListener('click', () => this.toggleSound());

      // Pause & Restart
      this.pauseBtn.addEventListener('click', () => this.togglePause());
      this.restartBtn.addEventListener('click', () => this.restartMatch());

      // Wardrobe Modal
      this.skinsBtn.addEventListener('click', () => this.openSkinsModal());
      this.closeSkinsBtn.addEventListener('click', () => this.closeSkinsModal());
      if (this.closeSkinsXBtn) {
        this.closeSkinsXBtn.addEventListener('click', () => this.closeSkinsModal());
      }
      this.skinsModal.addEventListener('click', (e) => {
        if (e.target === this.skinsModal) this.closeSkinsModal();
      });

      // Slime Lab Modal
      if (this.slimeMakerBtn) {
        this.slimeMakerBtn.addEventListener('click', () => this.openSlimeLab());
      }
      if (this.closeLabBtn) {
        this.closeLabBtn.addEventListener('click', () => this.closeSlimeLab());
      }
      if (this.closeLabXBtn) {
        this.closeLabXBtn.addEventListener('click', () => this.closeSlimeLab());
      }
      if (this.slimeLabModal) {
        this.slimeLabModal.addEventListener('click', (e) => {
          if (e.target === this.slimeLabModal) this.closeSlimeLab();
        });
      }
    }

    bindTouchControls() {
      const bindBtn = (id, onDown, onUp) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); }, { passive: false });
        el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); }, { passive: false });
        el.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(); });
        el.addEventListener('mouseup', (e) => { e.preventDefault(); onUp(); });
      };

      bindBtn('btnTouchLeft', () => { this.keys.a = true; }, () => { this.keys.a = false; });
      bindBtn('btnTouchRight', () => { this.keys.d = true; }, () => { this.keys.d = false; });
      bindBtn('btnTouchJump', () => { this.keys.w = true; }, () => { this.keys.w = false; });
      bindBtn('btnTouchSpike', () => { this.keys.space = true; setTimeout(() => { this.keys.space = false; }, 200); }, () => {});
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

    toggleSound() {
      if (!window.slimeAudio) return;
      const isMuted = window.slimeAudio.toggleMute();
      this.soundToggleBtn.textContent = isMuted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
      this.soundToggleBtn.classList.toggle('muted', isMuted);
    }

    togglePause() {
      if (this.state === 'START' || this.state === 'GAMEOVER') return;
      if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.overlay.classList.add('hidden');
        this.pauseBtn.textContent = '⏸ Pause';
      } else {
        this.state = 'PAUSED';
        this.overlayTitle.textContent = 'Game Paused';
        this.overlayMsg.textContent = 'Match is on hold. Press Resume to jump back into action!';
        this.actionBtn.textContent = 'Resume';
        this.overlay.classList.remove('hidden');
        this.pauseBtn.textContent = '▶ Resume';
      }
    }

    openSkinsModal() {
      this.skinsModal.classList.remove('hidden');
      if (this.state === 'PLAYING') this.togglePause();
      this.buildSkinsGrid();
    }

    closeSkinsModal() {
      this.skinsModal.classList.add('hidden');
      this.warpGameToScreen();
    }

    // Slime Currency Management
    initSlimeCoins() {
      if (this.coinsVal) this.coinsVal.textContent = this.coins;
      if (this.labCoinsVal) this.labCoinsVal.textContent = this.coins;
    }

    addCoins(amt) {
      this.coins = Math.max(0, this.coins + amt);
      localStorage.setItem('slime_coins', this.coins);
      if (this.coinsVal) this.coinsVal.textContent = this.coins;
      if (this.labCoinsVal) this.labCoinsVal.textContent = this.coins;

      if (amt > 0) {
        if (this.coinsBadge) {
          this.coinsBadge.classList.remove('bump');
          void this.coinsBadge.offsetWidth;
          this.coinsBadge.classList.add('bump');
        }
        if (window.slimeAudio) window.slimeAudio.playCoinSound();
      }
    }

    // Slime Lab Controller
    openSlimeLab() {
      if (!this.slimeLabModal) return;
      this.slimeLabModal.classList.remove('hidden');
      if (this.state === 'PLAYING') this.togglePause();
      this.renderColorPalette();
      this.renderTexturesGrid();
      if (this.labCoinsVal) this.labCoinsVal.textContent = this.coins;
      const texObj = SLIME_TEXTURES[this.makerTexture];
      if (this.activeTextureLabel && texObj) {
        this.activeTextureLabel.innerHTML = `Texture: <strong>${texObj.name}</strong>`;
      }
    }

    closeSlimeLab() {
      if (!this.slimeLabModal) return;
      this.slimeLabModal.classList.add('hidden');
      this.warpGameToScreen();
    }

    initSlimeLab() {
      // Tab switcher
      if (this.tabMakerBtn && this.tabTexturesBtn) {
        this.tabMakerBtn.addEventListener('click', () => {
          this.tabMakerBtn.classList.add('active');
          this.tabTexturesBtn.classList.remove('active');
          if (this.tabMakerContent) this.tabMakerContent.classList.remove('hidden');
          if (this.tabTexturesContent) this.tabTexturesContent.classList.add('hidden');
        });

        this.tabTexturesBtn.addEventListener('click', () => {
          this.tabTexturesBtn.classList.add('active');
          this.tabMakerBtn.classList.remove('active');
          if (this.tabTexturesContent) this.tabTexturesContent.classList.remove('hidden');
          if (this.tabMakerContent) this.tabMakerContent.classList.add('hidden');
          this.renderTexturesGrid();
        });
      }

      // Stickiness slider
      if (this.stickinessSlider) {
        this.stickinessSlider.value = this.makerStickiness;
        this.stickinessSlider.addEventListener('input', (e) => {
          this.makerStickiness = parseInt(e.target.value, 10);
          const trait = STICKINESS_TRAITS[this.makerStickiness];
          if (this.stickinessValueLabel && trait) {
            this.stickinessValueLabel.textContent = trait.name;
          }
          if (this.stickinessTraitDesc && trait) {
            this.stickinessTraitDesc.textContent = trait.desc;
          }
          if (window.slimeAudio) {
            window.slimeAudio.playASMRSquish(this.makerStickiness);
          }
        });
      }

      // Custom Color Picker
      if (this.customColorPicker) {
        this.customColorPicker.value = this.makerColor;
        this.customColorPicker.addEventListener('input', (e) => {
          this.makerColor = e.target.value;
          document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
        });
      }

      // Equip Custom Slime Button
      if (this.equipCustomSlimeBtn) {
        this.equipCustomSlimeBtn.addEventListener('click', () => {
          this.customSlimeData = {
            color: this.makerColor,
            stickiness: this.makerStickiness,
            texture: this.makerTexture,
            isEquipped: true
          };
          localStorage.setItem('slime_custom_data', JSON.stringify(this.customSlimeData));
          this.p1.applyCustomConfig(this.customSlimeData);

          const texObj = SLIME_TEXTURES[this.makerTexture];
          const avatar = texObj ? texObj.icon : '🧪';
          const p1AvatarEl = document.getElementById('p1Avatar');
          if (p1AvatarEl) p1AvatarEl.textContent = avatar;

          const prevText = this.equipCustomSlimeBtn.textContent;
          this.equipCustomSlimeBtn.textContent = '✓ Slime Equipped & Ready!';
          this.equipCustomSlimeBtn.style.transform = 'scale(1.03)';
          setTimeout(() => {
            this.equipCustomSlimeBtn.textContent = prevText;
            this.equipCustomSlimeBtn.style.transform = '';
          }, 1400);

          if (window.slimeAudio) window.slimeAudio.playBuySound();
        });
      }

      this.renderColorPalette();
      this.renderTexturesGrid();
      this.setupSlimePreviewBowl();
    }

    renderColorPalette() {
      if (!this.colorPalette) return;
      this.colorPalette.innerHTML = '';

      PRESET_COLORS.forEach(c => {
        const swatch = document.createElement('div');
        swatch.className = `color-swatch ${this.makerColor.toLowerCase() === c.hex.toLowerCase() ? 'active' : ''}`;
        swatch.style.backgroundColor = c.hex;
        swatch.title = c.name;

        swatch.addEventListener('click', () => {
          this.makerColor = c.hex;
          if (this.customColorPicker) this.customColorPicker.value = c.hex;
          this.renderColorPalette();
          if (window.slimeAudio) window.slimeAudio.playASMRSquish(this.makerStickiness);
        });

        this.colorPalette.appendChild(swatch);
      });
    }

    renderTexturesGrid() {
      if (!this.texturesGrid) return;
      this.texturesGrid.innerHTML = '';

      Object.values(SLIME_TEXTURES).forEach(tex => {
        const isOwned = this.unlockedTextures.includes(tex.id);
        const isEquipped = this.makerTexture === tex.id;

        const card = document.createElement('div');
        card.className = `texture-card ${isEquipped ? 'equipped' : ''}`;

        // Preview Canvas
        const preview = document.createElement('canvas');
        preview.width = 80;
        preview.height = 55;
        preview.className = 'texture-preview-canvas';
        const pCtx = preview.getContext('2d');
        this.drawTexturePreview(pCtx, tex);

        const nameEl = document.createElement('div');
        nameEl.className = 'texture-name';
        nameEl.textContent = tex.name;

        const tagEl = document.createElement('div');
        tagEl.className = 'texture-price-tag';
        tagEl.textContent = isOwned ? 'UNLOCKED' : `🪙 ${tex.price} Coins`;

        const descEl = document.createElement('div');
        descEl.className = 'texture-desc';
        descEl.textContent = tex.desc;

        const btn = document.createElement('button');
        btn.className = 'btn btn-texture-action';

        if (isOwned) {
          if (isEquipped) {
            btn.className += ' btn-texture-equip';
            btn.textContent = '✓ Active';
            btn.disabled = true;
          } else {
            btn.className += ' btn-texture-equip';
            btn.textContent = 'Equip Texture';
            btn.addEventListener('click', () => {
              this.makerTexture = tex.id;
              if (this.activeTextureLabel) {
                this.activeTextureLabel.innerHTML = `Texture: <strong>${tex.name}</strong>`;
              }
              this.renderTexturesGrid();
              if (window.slimeAudio) {
                if (tex.id === 'cloud') window.slimeAudio.playCloudPuff();
                else if (tex.id === 'floam') window.slimeAudio.playFoamCrunch();
                else window.slimeAudio.playASMRSquish(this.makerStickiness);
              }
            });
          }
        } else {
          btn.className += ' btn-texture-buy';
          const canAfford = this.coins >= tex.price;
          btn.textContent = canAfford ? `Buy for 🪙${tex.price}` : `Need ${tex.price - this.coins} more 🪙`;
          if (!canAfford) {
            btn.style.opacity = '0.65';
          }
          btn.addEventListener('click', () => {
            if (this.coins >= tex.price) {
              this.addCoins(-tex.price);
              this.unlockedTextures.push(tex.id);
              localStorage.setItem('slime_unlocked_textures', JSON.stringify(this.unlockedTextures));
              this.makerTexture = tex.id;
              if (this.activeTextureLabel) {
                this.activeTextureLabel.innerHTML = `Texture: <strong>${tex.name}</strong>`;
              }
              if (window.slimeAudio) window.slimeAudio.playBuySound();
              this.renderTexturesGrid();
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

    drawTexturePreview(ctx, tex) {
      ctx.save();
      ctx.translate(40, 48);

      const r = 34;
      const grad = ctx.createRadialGradient(-10, -20, 5, 0, 0, r);
      if (tex.id === 'gold') {
        grad.addColorStop(0, '#fffbe0');
        grad.addColorStop(0.35, '#ffd700');
        grad.addColorStop(0.5, '#cca000');
        grad.addColorStop(0.52, '#fff3a8');
        grad.addColorStop(0.8, '#b8860b');
        grad.addColorStop(1, '#5c4308');
      } else if (tex.id === 'cloud') {
        grad.addColorStop(0, '#e0f7fa');
        grad.addColorStop(0.3, '#b2ebf2');
        grad.addColorStop(0.7, '#80deea');
        grad.addColorStop(1, '#26c6da');
      } else if (tex.id === 'crystal') {
        grad.addColorStop(0, 'rgba(224, 247, 250, 0.9)');
        grad.addColorStop(0.5, 'rgba(128, 222, 234, 0.7)');
        grad.addColorStop(1, 'rgba(0, 188, 212, 0.5)');
      } else if (tex.id === 'floam') {
        grad.addColorStop(0, '#ffccd5');
        grad.addColorStop(0.4, '#ff758f');
        grad.addColorStop(1, '#c9184a');
      } else if (tex.id === 'butter') {
        grad.addColorStop(0, '#fff3b0');
        grad.addColorStop(0.4, '#ffe66d');
        grad.addColorStop(1, '#e9c46a');
      } else if (tex.id === 'glitter') {
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

      // Texture Overlays on preview mini-dome
      if (tex.id === 'cloud') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(-14, -14, 11, 0, Math.PI * 2);
        ctx.arc(0, -22, 12, 0, Math.PI * 2);
        ctx.arc(14, -14, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (tex.id === 'floam') {
        const beads = ['#fff', '#00f5d4', '#ffd166', '#ff007f'];
        [[-16, -10], [-6, -20], [8, -16], [16, -8], [-2, -8]].forEach(([bx, by], i) => {
          ctx.fillStyle = beads[i % beads.length];
          ctx.beginPath();
          ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (tex.id === 'butter') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-18, -10);
        ctx.quadraticCurveTo(0, -22, 18, -8);
        ctx.stroke();
      } else if (tex.id === 'glitter') {
        ctx.fillStyle = '#fff3a8';
        [[-12, -14], [10, -18], [0, -8]].forEach(([sx, sy]) => {
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (tex.id === 'crystal') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -8);
        ctx.lineTo(0, -26);
        ctx.lineTo(16, -8);
        ctx.stroke();
      }

      // Eye
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(12, -14, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(14, -14, 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Interactive Squish & Poke Bowl Canvas
    setupSlimePreviewBowl() {
      const canvas = this.slimePreviewCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const cw = canvas.width;
      const ch = canvas.height;

      const bowlX = cw / 2;
      const bowlY = ch * 0.76;
      const bowlR = 72;

      const slimeState = {
        apexX: bowlX,
        apexY: bowlY - 34,
        vx: 0,
        vy: 0,
        isDragging: false,
        wobble: 0,
        particles: []
      };

      const getCanvasPos = (evt) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
        const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
        };
      };

      const handlePointerDown = (evt) => {
        const pos = getCanvasPos(evt);
        const dist = Math.hypot(pos.x - slimeState.apexX, pos.y - slimeState.apexY);
        if (dist < 60) {
          slimeState.isDragging = true;
          slimeState.apexX = pos.x;
          slimeState.apexY = pos.y;
          slimeState.wobble = 0.5;

          if (window.slimeAudio) {
            window.slimeAudio.playASMRSquish(this.makerStickiness);
          }

          for (let i = 0; i < 6; i++) {
            slimeState.particles.push({
              x: pos.x,
              y: pos.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: this.makerColor,
              life: 0.6
            });
          }
        }
      };

      const handlePointerMove = (evt) => {
        if (!slimeState.isDragging) return;
        const pos = getCanvasPos(evt);
        const maxDist = 72;
        const dx = pos.x - bowlX;
        const dy = pos.y - (bowlY - 20);
        const dist = Math.hypot(dx, dy);
        if (dist > maxDist) {
          slimeState.apexX = bowlX + (dx / dist) * maxDist;
          slimeState.apexY = (bowlY - 20) + (dy / dist) * maxDist;
        } else {
          slimeState.apexX = pos.x;
          slimeState.apexY = pos.y;
        }
      };

      const handlePointerUp = () => {
        if (slimeState.isDragging) {
          slimeState.isDragging = false;
          slimeState.wobble = 0.6 + this.makerStickiness * 0.1;

          if (window.slimeAudio) {
            if (this.makerTexture === 'cloud') {
              window.slimeAudio.playCloudPuff();
            } else if (this.makerTexture === 'floam') {
              window.slimeAudio.playFoamCrunch();
            } else {
              window.slimeAudio.playASMRSquish(this.makerStickiness);
            }
          }
        }
      };

      canvas.addEventListener('mousedown', handlePointerDown);
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);

      canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handlePointerDown(e); }, { passive: false });
      window.addEventListener('touchmove', handlePointerMove, { passive: true });
      window.addEventListener('touchend', handlePointerUp, { passive: true });

      const renderBowl = () => {
        ctx.clearRect(0, 0, cw, ch);

        const restX = bowlX;
        const restY = bowlY - 32;
        if (!slimeState.isDragging) {
          const k = 0.18;
          const damping = 0.78 - (this.makerStickiness - 1) * 0.04;
          const ax = (restX - slimeState.apexX) * k;
          const ay = (restY - slimeState.apexY) * k;
          slimeState.vx = (slimeState.vx + ax) * damping;
          slimeState.vy = (slimeState.vy + ay) * damping;
          slimeState.apexX += slimeState.vx;
          slimeState.apexY += slimeState.vy;
          slimeState.wobble *= 0.94;
        }

        // Draw Ceramic Bowl Interior / Back
        ctx.save();
        ctx.fillStyle = '#162842';
        ctx.beginPath();
        ctx.ellipse(bowlX, bowlY, bowlR, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw Slime Jelly Blob
        ctx.save();
        const grad = ctx.createRadialGradient(slimeState.apexX - 10, slimeState.apexY - 15, 6, bowlX, bowlY, bowlR);
        const curGrad = generateSlimeGradient(this.makerColor);
        if (this.makerTexture === 'gold') {
          grad.addColorStop(0, '#fffbe0');
          grad.addColorStop(0.3, '#ffd700');
          grad.addColorStop(0.5, '#cca000');
          grad.addColorStop(0.52, '#fff3a8');
          grad.addColorStop(0.8, '#b8860b');
          grad.addColorStop(1, '#5c4308');
        } else if (this.makerTexture === 'crystal') {
          grad.addColorStop(0, adjustColor(this.makerColor, 0.7));
          grad.addColorStop(0.4, adjustColor(this.makerColor, 0.3));
          grad.addColorStop(1, adjustColor(this.makerColor, -0.2));
        } else {
          grad.addColorStop(0, curGrad[0]);
          grad.addColorStop(0.3, curGrad[1]);
          grad.addColorStop(0.7, curGrad[2]);
          grad.addColorStop(1, curGrad[3]);
        }

        ctx.fillStyle = grad;
        ctx.strokeStyle = '#1a1a24';
        ctx.lineWidth = 2.8;

        const baseLeftX = bowlX - bowlR * 0.72;
        const baseRightX = bowlX + bowlR * 0.72;
        const baseY = bowlY + 4;

        ctx.beginPath();
        ctx.moveTo(baseLeftX, baseY);
        ctx.quadraticCurveTo(slimeState.apexX - 35, (baseY + slimeState.apexY) / 2 + 5, slimeState.apexX, slimeState.apexY);
        ctx.quadraticCurveTo(slimeState.apexX + 35, (baseY + slimeState.apexY) / 2 + 5, baseRightX, baseY);
        ctx.quadraticCurveTo(bowlX, baseY + 18, baseLeftX, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Texture Details in preview blob
        if (this.makerTexture === 'cloud') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(slimeState.apexX - 18, slimeState.apexY + 8, 14, 0, Math.PI * 2);
          ctx.arc(slimeState.apexX, slimeState.apexY, 15, 0, Math.PI * 2);
          ctx.arc(slimeState.apexX + 18, slimeState.apexY + 8, 13, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.makerTexture === 'floam') {
          const beadColors = ['#ffffff', '#ff99c8', '#70e000', '#ffd166', '#00f5d4'];
          const offsets = [
            [-22, 10, 0], [-10, -5, 1], [0, 8, 2], [14, -2, 3], [22, 12, 4],
            [-15, 20, 2], [10, 18, 0], [-2, 22, 1]
          ];
          offsets.forEach(([ox, oy, cIdx]) => {
            const bx = slimeState.apexX + ox;
            const by = slimeState.apexY + oy + 12;
            ctx.fillStyle = beadColors[cIdx % beadColors.length];
            ctx.beginPath();
            ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(bx - 1.2, by - 1.2, 1.5, 0, Math.PI * 2);
            ctx.fill();
          });
        } else if (this.makerTexture === 'butter') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(slimeState.apexX - 22, slimeState.apexY + 8);
          ctx.quadraticCurveTo(slimeState.apexX, slimeState.apexY - 2, slimeState.apexX + 22, slimeState.apexY + 12);
          ctx.stroke();
        } else if (this.makerTexture === 'glitter') {
          const stars = [[-16, 6], [0, -2], [15, 8], [-8, 20], [12, 22]];
          stars.forEach(([ox, oy]) => {
            const sx = slimeState.apexX + ox;
            const sy = slimeState.apexY + oy + 6;
            ctx.fillStyle = '#fff3a8';
            ctx.beginPath();
            ctx.moveTo(sx, sy - 4);
            ctx.quadraticCurveTo(sx, sy, sx + 4, sy);
            ctx.quadraticCurveTo(sx, sy, sx, sy + 4);
            ctx.quadraticCurveTo(sx, sy, sx - 4, sy);
            ctx.quadraticCurveTo(sx, sy, sx, sy - 4);
            ctx.fill();
          });
        } else if (this.makerTexture === 'crystal') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(slimeState.apexX - 18, slimeState.apexY + 14);
          ctx.lineTo(slimeState.apexX, slimeState.apexY + 2);
          ctx.lineTo(slimeState.apexX + 18, slimeState.apexY + 14);
          ctx.stroke();
        }

        // Stickiness Goo string when pulled high (Levels 4 & 5)
        if (this.makerStickiness >= 4 && slimeState.isDragging && slimeState.apexY < bowlY - 45) {
          ctx.strokeStyle = curGrad[2];
          ctx.lineWidth = this.makerStickiness === 5 ? 4 : 2.5;
          ctx.beginPath();
          ctx.moveTo(bowlX - 12, bowlY - 10);
          ctx.lineTo(slimeState.apexX - 8, slimeState.apexY + 12);
          ctx.moveTo(bowlX + 12, bowlY - 10);
          ctx.lineTo(slimeState.apexX + 8, slimeState.apexY + 12);
          ctx.stroke();
        }

        // Specular shine on apex
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(slimeState.apexX - 6, slimeState.apexY + 12, 14, Math.PI * 1.1, Math.PI * 1.55);
        ctx.stroke();

        ctx.restore();

        // Draw Ceramic Bowl Rim (Front layer)
        ctx.save();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#2b4d75';
        ctx.beginPath();
        ctx.ellipse(bowlX, bowlY, bowlR, 24, 0, 0, Math.PI);
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(bowlX, bowlY, bowlR - 2, 22, 0, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
        ctx.restore();

        // Update and draw preview particles
        for (let i = slimeState.particles.length - 1; i >= 0; i--) {
          const p = slimeState.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.03;
          if (p.life <= 0) {
            slimeState.particles.splice(i, 1);
          } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        requestAnimationFrame(renderBowl);
      };

      requestAnimationFrame(renderBowl);
    }

    buildSkinsGrid() {
      this.skinsGrid.innerHTML = '';

      // If user has created/equipped custom slime, show Custom Slime Card first!
      if (this.customSlimeData) {
        const cItem = document.createElement('div');
        const isCustomActive = this.p1.isCustom;
        cItem.className = `skin-item ${isCustomActive ? 'equipped' : ''}`;

        const preview = document.createElement('canvas');
        preview.width = 80;
        preview.height = 55;
        preview.className = 'skin-preview-canvas';
        const pCtx = preview.getContext('2d');

        pCtx.save();
        pCtx.translate(40, 48);
        const grad = pCtx.createRadialGradient(-10, -20, 5, 0, 0, 36);
        const cGrad = generateSlimeGradient(this.customSlimeData.color || '#38b000');
        grad.addColorStop(0, cGrad[0]);
        grad.addColorStop(0.3, cGrad[1]);
        grad.addColorStop(0.7, cGrad[2]);
        grad.addColorStop(1, cGrad[3]);
        pCtx.fillStyle = grad;
        pCtx.strokeStyle = '#1e1e24';
        pCtx.lineWidth = 2.5;
        pCtx.beginPath();
        pCtx.arc(0, 0, 36, Math.PI, 0, false);
        pCtx.closePath();
        pCtx.fill();
        pCtx.stroke();

        // Eye
        pCtx.fillStyle = '#fff';
        pCtx.beginPath();
        pCtx.arc(14, -18, 6.5, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.stroke();
        pCtx.fillStyle = '#111';
        pCtx.beginPath();
        pCtx.arc(16, -18, 3.5, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();

        const nameEl = document.createElement('div');
        nameEl.className = 'skin-name';
        nameEl.textContent = '🧪 My Custom Slime';

        const texName = (SLIME_TEXTURES[this.customSlimeData.texture] || {}).name || 'Classic';
        const powerEl = document.createElement('div');
        powerEl.className = 'skin-power-tag';
        powerEl.textContent = `✨ ${texName} · Lvl ${this.customSlimeData.stickiness || 3}`;

        const descEl = document.createElement('div');
        descEl.className = 'skin-desc';
        descEl.textContent = 'Crafted in Slime Lab with custom color & stickiness!';

        cItem.appendChild(preview);
        cItem.appendChild(nameEl);
        cItem.appendChild(powerEl);
        cItem.appendChild(descEl);

        cItem.addEventListener('click', () => {
          this.p1.applyCustomConfig(this.customSlimeData);
          const texObj = SLIME_TEXTURES[this.customSlimeData.texture];
          document.getElementById('p1Avatar').textContent = texObj ? texObj.icon : '🧪';
          this.buildSkinsGrid();
          if (window.slimeAudio) window.slimeAudio.playJump(1.2);
        });

        this.skinsGrid.appendChild(cItem);
      }

      Object.values(SLIMES).forEach(skin => {
        const item = document.createElement('div');
        item.className = `skin-item ${(!this.p1.isCustom && this.p1.skin.id === skin.id) ? 'equipped' : ''}`;

        const preview = document.createElement('canvas');
        preview.width = 80;
        preview.height = 55;
        preview.className = 'skin-preview-canvas';
        const pCtx = preview.getContext('2d');

        pCtx.save();
        pCtx.translate(40, 48);
        const grad = pCtx.createRadialGradient(-10, -20, 5, 0, 0, 36);
        grad.addColorStop(0, skin.grad[0]);
        grad.addColorStop(0.3, skin.grad[1]);
        grad.addColorStop(0.7, skin.grad[2]);
        grad.addColorStop(1, skin.grad[3]);
        pCtx.fillStyle = grad;
        pCtx.strokeStyle = '#1e1e24';
        pCtx.lineWidth = 2.5;
        pCtx.beginPath();
        pCtx.arc(0, 0, 36, Math.PI, 0, false);
        pCtx.closePath();
        pCtx.fill();
        pCtx.stroke();

        pCtx.fillStyle = '#fff';
        pCtx.beginPath();
        pCtx.arc(14, -18, 6.5, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.stroke();
        pCtx.fillStyle = '#111';
        pCtx.beginPath();
        pCtx.arc(16, -18, 3.5, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();

        const nameEl = document.createElement('div');
        nameEl.className = 'skin-name';
        nameEl.textContent = skin.name;

        const powerEl = document.createElement('div');
        powerEl.className = 'skin-power-tag';
        powerEl.textContent = `⚡ ${skin.powerName}`;

        const descEl = document.createElement('div');
        descEl.className = 'skin-desc';
        descEl.textContent = skin.powerDesc;

        item.appendChild(preview);
        item.appendChild(nameEl);
        item.appendChild(powerEl);
        item.appendChild(descEl);

        item.addEventListener('click', () => {
          this.p1.setSkin(skin.id);
          document.getElementById('p1Avatar').textContent = skin.avatar;
          this.buildSkinsGrid();
          if (window.slimeAudio) window.slimeAudio.playJump(1.2);
        });

        this.skinsGrid.appendChild(item);
      });
    }

    startMatch() {
      this.p1Score = 0;
      this.p2Score = 0;
      this.rally = 0;
      this.updateScoreboard();
      this.overlay.classList.add('hidden');
      this.serve('left');
    }

    restartMatch() {
      this.startMatch();
    }

    serve(side = 'left') {
      this.servingSide = side;
      this.state = 'SERVING';
      this.ball.reset(side);
      this.p1.x = 200;
      this.p1.y = FLOOR_Y;
      this.p1.vx = 0;
      this.p1.vy = 0;
      this.p2.x = 760;
      this.p2.y = FLOOR_Y;
      this.p2.vx = 0;
      this.p2.vy = 0;

      if (window.slimeAudio) window.slimeAudio.playWhistle();

      setTimeout(() => {
        if (this.state === 'SERVING') {
          this.state = 'PLAYING';
        }
      }, 700);
    }

    // Execute super power
    activateSuperMove(player) {
      if (player.superMeter < 100) return;
      player.superMeter = 0;
      player.triggerWobble(0.6);

      if (window.slimeAudio) window.slimeAudio.playSuperMove();

      // Visual particles explosion
      for (let i = 0; i < 20; i++) {
        this.particles.push(new Particle(player.x, player.y - 25, player.skin.glow, 6, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12));
      }

      // Check ball proximity: Spike the ball!
      const dist = Math.hypot(this.ball.x - player.x, this.ball.y - player.y);
      if (dist < 180) {
        this.ball.isSuper = true;
        this.ball.superColor = player.skin.glow;
        const dir = player.side === 'left' ? 1 : -1;
        this.ball.vx = dir * 21;
        this.ball.vy = -7;
        if (window.slimeAudio) window.slimeAudio.playSpike();
      } else {
        // High speed dash towards ball
        player.isDashing = true;
        player.dashTimer = 0.28;
        player.vx = (player.side === 'left' ? 1 : -1) * 16;
      }

      this.updateSuperMeterUI();
    }

    updateSuperMeterUI() {
      this.p1PowerFillEl.style.width = `${this.p1.superMeter}%`;
      this.p1PowerFillEl.classList.toggle('ready', this.p1.superMeter >= 100);

      this.p2PowerFillEl.style.width = `${this.p2.superMeter}%`;
      this.p2PowerFillEl.classList.toggle('ready', this.p2.superMeter >= 100);
    }

    updateScoreboard() {
      this.p1ScoreEl.textContent = this.p1Score;
      this.p2ScoreEl.textContent = this.p2Score;
      this.rallyCountEl.textContent = this.rally;
      this.updateSuperMeterUI();
    }

    handlePointScored(scoringSide) {
      this.state = 'SCORED';
      this.rally = 0;

      if (scoringSide === 'left') {
        this.p1Score++;
        this.addCoins(20);
        if (window.slimeAudio) window.slimeAudio.playPointScored();
      } else {
        this.p2Score++;
        if (window.slimeAudio) {
          if (this.mode === 'soccer') window.slimeAudio.playGoalHorn();
          else window.slimeAudio.playPointScored();
        }
      }

      this.updateScoreboard();

      // Burst Confetti on Score
      for (let i = 0; i < 40; i++) {
        this.confetti.push(new Confetti(this.ball.x, Math.min(this.ball.y, FLOOR_Y - 40)));
      }

      // Check Match Victory
      if (this.p1Score >= WINNING_SCORE || this.p2Score >= WINNING_SCORE) {
        setTimeout(() => this.endMatch(scoringSide), 1000);
      } else {
        setTimeout(() => {
          this.serve(scoringSide === 'left' ? 'left' : 'right');
        }, 1400);
      }
    }

    endMatch(winnerSide) {
      this.state = 'GAMEOVER';
      const isP1Win = winnerSide === 'left';
      this.overlayTitle.textContent = isP1Win ? '🎉 Match Victory!' : 'Defeat!';
      this.overlayMascot.textContent = isP1Win ? '🏆' : '💀';

      if (this.isTwoPlayer) {
        this.overlayMsg.textContent = isP1Win ? 'Player 1 wins the championship match!' : 'Player 2 wins the championship match!';
      } else {
        this.overlayMsg.textContent = isP1Win ? 'You defeated the Robo-Slime in an epic jelly clash!' : 'Robo-Slime took the victory. Try again with a new strategy!';
      }

      if (isP1Win) {
        this.addCoins(100);
      }

      this.actionBtn.textContent = 'Play Again';
      this.overlay.classList.remove('hidden');

      if (isP1Win && window.slimeAudio) {
        window.slimeAudio.playVictory();
      }

      // Victory confetti shower
      for (let i = 0; i < 90; i++) {
        this.confetti.push(new Confetti(CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 500, 100));
      }
    }

    // Smart AI Bot Controller
    updateAI(dt) {
      if (this.isTwoPlayer) {
        // Player 2 Local Controls
        let vx = 0;
        if (this.keys.arrowLeft) vx -= this.p2.speed;
        if (this.keys.arrowRight) vx += this.p2.speed;
        this.p2.vx = vx;
        if (this.keys.arrowUp) this.p2.jump();
        if (this.keys.enter) this.activateSuperMove(this.p2);
        return;
      }

      // AI Bot Logic based on difficulty
      const bot = this.p2;
      const b = this.ball;
      const targetSpeed = this.difficulty === 'hard' ? 8.2 : (this.difficulty === 'medium' ? 6.8 : 5.0);
      const jumpAccuracy = this.difficulty === 'hard' ? 45 : (this.difficulty === 'medium' ? 65 : 85);

      // Desired position: under the predicted ball landing spot
      let desiredX = 720;
      if (b.x > this.netX - 50) {
        // Ball is in or heading towards bot court
        desiredX = b.x;
        if (b.vx > 0) {
          // Lead ahead of ball
          desiredX += b.vx * 12;
        }
      }

      // Stay on right side of net
      desiredX = Math.max(this.netX + bot.radius + 15, Math.min(CANVAS_WIDTH - bot.radius - 20, desiredX));

      // Move towards desiredX
      if (bot.x < desiredX - 12) {
        bot.vx = targetSpeed;
      } else if (bot.x > desiredX + 12) {
        bot.vx = -targetSpeed;
      } else {
        bot.vx = 0;
      }

      // Jump to Spike / Defend
      if (b.x > this.netX && Math.abs(b.x - bot.x) < jumpAccuracy && b.y < FLOOR_Y - 90 && b.y > 180) {
        if (Math.random() < (this.difficulty === 'hard' ? 0.85 : 0.6)) {
          bot.jump();
        }
      }

      // AI Super Power Trigger
      if (bot.superMeter >= 100 && b.x > this.netX && Math.abs(b.x - bot.x) < 120 && b.y < 350) {
        this.activateSuperMove(bot);
      }
    }

    // Slime vs Ball Physics Collision
    checkSlimeBallCollision(slime) {
      const b = this.ball;
      const dx = b.x - slime.x;
      const dy = b.y - slime.y;
      const dist = Math.hypot(dx, dy);
      const minDist = slime.radius + b.radius;

      // Slime is a semi-circle dome (only hits if ball is above or at slime center)
      if (dist < minDist && b.y <= slime.y + 12) {
        // Normal vector
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        // Position correction (prevent ball sinking into jelly body)
        b.x = slime.x + nx * minDist;
        b.y = slime.y + ny * minDist;

        // Relative velocity
        const rvx = b.vx - slime.vx;
        const rvy = b.vy - slime.vy;
        const normalVel = rvx * nx + rvy * ny;

        if (normalVel < 0) {
          // Restitution based on stickiness and texture
          let restitution = 1.08;
          if (slime.isCustom) {
            const trait = STICKINESS_TRAITS[slime.stickiness];
            if (trait) restitution = trait.restitution;
            if (slime.texture === 'crystal') restitution += 0.04;
            if (slime.texture === 'butter') restitution -= 0.04;
          }

          b.vx = b.vx - (1 + restitution) * normalVel * nx + slime.vx * 0.35;
          b.vy = b.vy - (1 + restitution) * normalVel * ny + slime.vy * 0.35;

          // High stickiness (Levels 4 & 5) gives strong directional traction from slime movement
          if (slime.isCustom && slime.stickiness >= 4) {
            b.vx += slime.vx * (slime.stickiness === 5 ? 0.38 : 0.22);
          }

          // Extra upward boost if hitting top dome
          if (ny < -0.4) {
            b.vy = Math.min(-7, b.vy - 3);
          }

          // Trigger soft-body squish wobble
          slime.triggerWobble(0.35);

          // Particles splash based on skin & texture
          const splashColor = slime.isCustom ? (slime.customGrad ? slime.customGrad[1] : slime.customColor) : slime.skin.color;
          for (let p = 0; p < 8; p++) {
            this.particles.push(new Particle(b.x, b.y, splashColor, 4, nx * 4 + (Math.random() - 0.5) * 5, ny * 4 + (Math.random() - 0.5) * 5));
          }

          // Special texture impact particles & sounds
          if (slime.isCustom) {
            if (slime.texture === 'cloud') {
              for (let p = 0; p < 6; p++) {
                this.particles.push(new Particle(b.x, b.y, 'rgba(255, 255, 255, 0.88)', 6 + Math.random() * 4, (Math.random() - 0.5) * 4, -1 - Math.random() * 3, 0.8, false));
              }
              if (window.slimeAudio) window.slimeAudio.playCloudPuff();
            } else if (slime.texture === 'floam') {
              const beads = ['#ff99c8', '#70e000', '#ffd166', '#00f5d4'];
              for (let p = 0; p < 7; p++) {
                this.particles.push(new Particle(b.x, b.y, beads[p % beads.length], 4.5, (Math.random() - 0.5) * 8, -2 - Math.random() * 5, 0.9, true));
              }
              if (window.slimeAudio) window.slimeAudio.playFoamCrunch();
            } else if (slime.texture === 'glitter') {
              for (let p = 0; p < 8; p++) {
                this.particles.push(new Particle(b.x, b.y, '#fff3a8', 3.5, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, 0.7, false));
              }
            } else if (slime.stickiness >= 4) {
              for (let p = 0; p < 6; p++) {
                this.particles.push(new Particle(b.x, b.y, splashColor, 3.5, (Math.random() - 0.5) * 3, 1 + Math.random() * 4, 1.2, true));
              }
            }

            if (window.slimeAudio) {
              window.slimeAudio.playASMRSquish(slime.stickiness);
            }
          } else {
            if (window.slimeAudio) {
              window.slimeAudio.playSquish(Math.hypot(b.vx, b.vy));
            }
          }

          // Increment rally & super meter
          this.rally++;
          this.updateScoreboard();
          slime.superMeter = Math.min(100, slime.superMeter + 25);
          this.updateSuperMeterUI();

          // Reward coins for rally hit!
          this.addCoins(2);
        }
      }
    }

    // Physics Engine Update
    updatePhysics(dt) {
      if (this.state !== 'PLAYING') return;

      // 1. Player 1 Movement
      let p1vx = 0;
      if (this.keys.a) p1vx -= this.p1.speed;
      if (this.keys.d) p1vx += this.p1.speed;
      this.p1.vx = p1vx;
      if (this.keys.w) this.p1.jump();
      if (this.keys.space) this.activateSuperMove(this.p1);

      // 2. Player 2 / AI Bot Movement
      this.updateAI(dt);

      // 3. Update Slimes
      this.p1.update(dt, this.ball, this.netX, CANVAS_WIDTH);
      this.p2.update(dt, this.ball, this.netX, CANVAS_WIDTH);

      // 4. Update Ball
      this.ball.update(dt);

      // 5. Slime vs Ball Collisions
      this.checkSlimeBallCollision(this.p1);
      this.checkSlimeBallCollision(this.p2);

      // 6. Net Collision (Volleyball Mode)
      if (this.mode === 'volleyball') {
        const netTop = FLOOR_Y - this.netHeight;
        const netL = this.netX - this.netWidth / 2;
        const netR = this.netX + this.netWidth / 2;

        // Collision with top rounded cap of net
        const capDist = Math.hypot(this.ball.x - this.netX, this.ball.y - netTop);
        if (capDist < this.ball.radius + this.netWidth / 2) {
          const cnx = (this.ball.x - this.netX) / capDist;
          const cny = (this.ball.y - netTop) / capDist;
          this.ball.vx = cnx * Math.max(5, Math.abs(this.ball.vx));
          this.ball.vy = cny * Math.max(6, Math.abs(this.ball.vy));
          if (window.slimeAudio) window.slimeAudio.playBounce('net');
        } else if (this.ball.y > netTop && this.ball.y < FLOOR_Y) {
          // Collision with net vertical post
          if (this.ball.x + this.ball.radius >= netL && this.ball.x - this.ball.radius <= netR) {
            if (this.ball.vx > 0) {
              this.ball.x = netL - this.ball.radius;
              this.ball.vx = -this.ball.vx * 0.85;
            } else {
              this.ball.x = netR + this.ball.radius;
              this.ball.vx = -this.ball.vx * 0.85;
            }
            if (window.slimeAudio) window.slimeAudio.playBounce('net');
          }
        }
      }

      // 7. Wall Collisions
      if (this.ball.x - this.ball.radius <= 0) {
        this.ball.x = this.ball.radius;
        this.ball.vx = -this.ball.vx * 0.82;
        if (window.slimeAudio) window.slimeAudio.playBounce('wall');
      } else if (this.ball.x + this.ball.radius >= CANVAS_WIDTH) {
        this.ball.x = CANVAS_WIDTH - this.ball.radius;
        this.ball.vx = -this.ball.vx * 0.82;
        if (window.slimeAudio) window.slimeAudio.playBounce('wall');
      }

      // Ceiling Collision
      if (this.ball.y - this.ball.radius <= 0) {
        this.ball.y = this.ball.radius;
        this.ball.vy = Math.abs(this.ball.vy) * 0.8;
      }

      // 8. Floor Collision & Scoring
      if (this.ball.y + this.ball.radius >= FLOOR_Y) {
        this.ball.y = FLOOR_Y - this.ball.radius;

        if (this.mode === 'volleyball') {
          // In volleyball, ball hitting the floor scores a point!
          if (this.ball.x < this.netX) {
            this.handlePointScored('right'); // Landed on P1 side -> P2 scores
          } else {
            this.handlePointScored('left');  // Landed on P2 side -> P1 scores
          }
        } else {
          // In soccer, ball bounces on floor
          this.ball.vy = -this.ball.vy * 0.78;
          if (Math.abs(this.ball.vy) < 2) this.ball.vy = 0;
          if (window.slimeAudio) window.slimeAudio.playBounce('floor', Math.abs(this.ball.vy));
        }
      }

      // 9. Soccer Goal Scoring Detection
      if (this.mode === 'soccer') {
        const goalH = 140; // Goal height from floor
        if (this.ball.y >= FLOOR_Y - goalH) {
          // Left Goal (P2 scores)
          if (this.ball.x - this.ball.radius <= 40) {
            this.handlePointScored('right');
          }
          // Right Goal (P1 scores)
          else if (this.ball.x + this.ball.radius >= CANVAS_WIDTH - 40) {
            this.handlePointScored('left');
          }
        }
      }
    }

    // Main Draw Method
    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background Sky & Court
      this.drawCourt(ctx);

      // Draw Slimes
      this.p1.draw(ctx);
      this.p2.draw(ctx);

      // Draw Net / Goals
      if (this.mode === 'volleyball') {
        this.drawNet(ctx);
      } else {
        this.drawGoals(ctx);
      }

      // Draw Ball
      this.ball.draw(ctx);

      // Draw Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.update(0.016);
        p.draw(ctx);
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      // Draw Confetti
      for (let i = this.confetti.length - 1; i >= 0; i--) {
        const c = this.confetti[i];
        c.update(0.016);
        c.draw(ctx);
        if (c.life <= 0) this.confetti.splice(i, 1);
      }
    }

    drawCourt(ctx) {
      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
      skyGrad.addColorStop(0, '#0a2540');
      skyGrad.addColorStop(0.6, '#1e3d59');
      skyGrad.addColorStop(1, '#17b978');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, FLOOR_Y);

      // Stadium Spectators / Hills Silhouette
      ctx.fillStyle = 'rgba(10, 25, 47, 0.45)';
      ctx.beginPath();
      ctx.arc(200, FLOOR_Y + 50, 220, Math.PI, 0);
      ctx.arc(500, FLOOR_Y + 70, 260, Math.PI, 0);
      ctx.arc(800, FLOOR_Y + 40, 200, Math.PI, 0);
      ctx.fill();

      // Court Floor (Grass/Sand)
      const floorGrad = ctx.createLinearGradient(0, FLOOR_Y, 0, CANVAS_HEIGHT);
      if (this.mode === 'volleyball') {
        // Sandy beach court
        floorGrad.addColorStop(0, '#f4a261');
        floorGrad.addColorStop(0.2, '#e76f51');
        floorGrad.addColorStop(1, '#8d4925');
      } else {
        // Lush soccer pitch
        floorGrad.addColorStop(0, '#38b000');
        floorGrad.addColorStop(0.2, '#007200');
        floorGrad.addColorStop(1, '#004b23');
      }
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FLOOR_Y);

      // Court Line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, FLOOR_Y);
      ctx.lineTo(CANVAS_WIDTH, FLOOR_Y);
      ctx.stroke();
    }

    drawNet(ctx) {
      const netTop = FLOOR_Y - this.netHeight;
      const netX = this.netX;

      // Net Post
      ctx.fillStyle = '#6c757d';
      ctx.fillRect(netX - this.netWidth / 2, netTop, this.netWidth, this.netHeight);

      // Top White Band
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(netX - this.netWidth / 2 - 2, netTop - 2, this.netWidth + 4, 10);

      // Net Mesh Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let y = netTop + 8; y < FLOOR_Y; y += 12) {
        ctx.moveTo(netX - this.netWidth / 2, y);
        ctx.lineTo(netX + this.netWidth / 2, y);
      }
      for (let x = netX - this.netWidth / 2; x <= netX + this.netWidth / 2; x += 4) {
        ctx.moveTo(x, netTop);
        ctx.lineTo(x, FLOOR_Y);
      }
      ctx.stroke();

      // Rounded Top Cap
      ctx.fillStyle = '#ffbe0b';
      ctx.beginPath();
      ctx.arc(netX, netTop, this.netWidth / 2 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    drawGoals(ctx) {
      const goalH = 140;
      const goalW = 40;

      // Left Goal Post
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, FLOOR_Y - goalH);
      ctx.lineTo(goalW, FLOOR_Y - goalH);
      ctx.lineTo(goalW, FLOOR_Y);
      ctx.stroke();

      // Right Goal Post
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH, FLOOR_Y - goalH);
      ctx.lineTo(CANVAS_WIDTH - goalW, FLOOR_Y - goalH);
      ctx.lineTo(CANVAS_WIDTH - goalW, FLOOR_Y);
      ctx.stroke();

      // Net Meshes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      for (let y = FLOOR_Y - goalH; y < FLOOR_Y; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(goalW, y);
        ctx.moveTo(CANVAS_WIDTH, y);
        ctx.lineTo(CANVAS_WIDTH - goalW, y);
        ctx.stroke();
      }
    }

    // Main Animation Loop
    loop(timestamp) {
      const dt = Math.min(0.04, (timestamp - this.lastTime) / 1000);
      this.lastTime = timestamp;
      this.time += dt;

      this.updatePhysics(dt);
      this.render();

      requestAnimationFrame((t) => this.loop(t));
    }
  }

  // Launch on DOM Ready
  window.addEventListener('DOMContentLoaded', () => {
    window.slimeGame = new Game();
  });
})();
