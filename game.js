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
    }

    setSkin(skinId) {
      if (SLIMES[skinId]) {
        this.skin = SLIMES[skinId];
      }
    }

    jump() {
      if (this.isGrounded) {
        this.vy = -this.jumpForce;
        this.isGrounded = false;
        // Stretch vertically when jumping
        this.scaleY = 1.35;
        this.scaleX = 0.78;
        if (window.slimeAudio) window.slimeAudio.playJump();
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
        this.vy += GRAVITY * dt * 60;
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

      // Gradient Fill
      const grad = ctx.createRadialGradient(-15, -30, 8, 0, 0, this.radius);
      grad.addColorStop(0, this.skin.grad[0]);
      grad.addColorStop(0.3, this.skin.grad[1]);
      grad.addColorStop(0.7, this.skin.grad[2]);
      grad.addColorStop(1, this.skin.grad[3]);

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

      // Entities
      this.p1 = new Slime(200, 'left', 'goopy');
      this.p2 = new Slime(760, 'right', 'magma');
      this.ball = new Ball(this.mode);
      this.particles = [];
      this.confetti = [];

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
        if (e.code === 'Escape') this.closeSkinsModal();
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
    }

    closeSkinsModal() {
      this.skinsModal.classList.add('hidden');
      this.warpGameToScreen();
    }

    buildSkinsGrid() {
      this.skinsGrid.innerHTML = '';
      Object.values(SLIMES).forEach(skin => {
        const item = document.createElement('div');
        item.className = `skin-item ${this.p1.skin.id === skin.id ? 'equipped' : ''}`;

        const preview = document.createElement('canvas');
        preview.width = 80;
        preview.height = 55;
        preview.className = 'skin-preview-canvas';
        const pCtx = preview.getContext('2d');

        // Draw preview mini slime
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
          // Elastic jelly bounce response
          const restitution = 1.08;
          b.vx = b.vx - (1 + restitution) * normalVel * nx + slime.vx * 0.35;
          b.vy = b.vy - (1 + restitution) * normalVel * ny + slime.vy * 0.35;

          // Extra upward boost if hitting top dome
          if (ny < -0.4) {
            b.vy = Math.min(-7, b.vy - 3);
          }

          // Trigger soft-body squish wobble
          slime.triggerWobble(0.35);

          // Particles splash
          for (let p = 0; p < 8; p++) {
            this.particles.push(new Particle(b.x, b.y, slime.skin.color, 4, nx * 4 + (Math.random() - 0.5) * 5, ny * 4 + (Math.random() - 0.5) * 5));
          }

          // Increment rally & super meter
          this.rally++;
          this.updateScoreboard();
          slime.superMeter = Math.min(100, slime.superMeter + 25);
          this.updateSuperMeterUI();

          // Sound
          if (window.slimeAudio) {
            window.slimeAudio.playSquish(Math.hypot(b.vx, b.vy));
          }
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
