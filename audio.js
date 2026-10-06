/**
 * Slime Arcade - Web Audio API Synthesizer
 * High quality retro/cartoon audio synthesized entirely with the Web Audio API.
 * Zero external audio files required, completely self-contained and instant.
 */

class SlimeAudio {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('slime_sound_muted') === 'true';
    this.masterGain = null;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();

    // Studio Quality Dynamics Compressor for loud, punchy, distortion-free ASMR
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(6, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4.5, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1.15, this.ctx.currentTime);

    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    localStorage.setItem('slime_sound_muted', this.muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1.15, this.ctx.currentTime);
    }
    return this.muted;
  }

  // Play bouncy jelly jump sound
  playJump(pitch = 1.0) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(380 * pitch, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(260 * pitch, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Soft wet squishy ball hit sound
  playSquish(power = 1.0) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Body boing
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = 220 + Math.min(200, power * 80);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);

    // Wet slap noise burst
    this.playNoise(0.06, 0.25, 800);
  }

  // Fast powerful spike hit
  playSpike() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.26);

    this.playNoise(0.12, 0.45, 1200);
  }

  // Ball bounce on floor/net/wall
  playBounce(surface = 'floor', speed = 5) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const vol = Math.min(0.4, Math.max(0.1, speed / 25));
    osc.type = 'sine';
    const freq = surface === 'net' ? 180 : (surface === 'wall' ? 260 : 150);
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Super power activation whoosh
  playSuperMove() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Point scored whistle / cheer
  playPointScored() {
    if (this.muted || !this.ctx) return;
    this.playWhistle();
    setTimeout(() => this.playCheer(), 180);
  }

  // Whistle chirp
  playWhistle() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(2600, now);
    osc2.frequency.setValueAtTime(2680, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.setValueAtTime(0.25, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  }

  // Crowd cheer synthesized from modulated bandpass noise
  playCheer() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i / bufferSize * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  // Stadium goal horn for soccer mode
  playGoalHorn() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [130.81, 164.81, 196.00]; // Low C major chord

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0.22, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  // Fanfare for match victory
  playVictory() {
    if (this.muted || !this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.42);
      }, idx * 130);
    });
  }

  // Helper: filtered noise burst with filter type and resonance
  playNoise(duration = 0.1, volume = 0.35, filterFreq = 1200, filterType = 'lowpass', q = 1.0) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.max(128, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.Q.setValueAtTime(q, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  // ASMR Interactive Slime Poke / Squish Sound
  // Multi-layered: visceral sub-thump + resonant suction air pop + high-frequency wet squelch
  playASMRSquish(stickiness = 3) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Visceral Deep Sub-Bass Thud (punchy finger impact into jelly mass)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    const subFreq = Math.max(50, 115 - stickiness * 9);
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(subFreq, now);
    subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

    subGain.gain.setValueAtTime(0.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.16);

    // 2. Resonant Wet Suction Cavity Pop
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    const startPop = 240 + Math.random() * 40;
    popOsc.type = stickiness >= 4 ? 'sawtooth' : 'triangle';
    popOsc.frequency.setValueAtTime(startPop, now);
    popOsc.frequency.exponentialRampToValueAtTime(startPop * 1.5, now + 0.025);
    popOsc.frequency.exponentialRampToValueAtTime(80, now + 0.10 + stickiness * 0.02);

    const popVol = 0.55 + stickiness * 0.05;
    popGain.gain.setValueAtTime(popVol, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12 + stickiness * 0.02);

    popOsc.connect(popGain);
    popGain.connect(this.masterGain);
    popOsc.start(now);
    popOsc.stop(now + 0.15 + stickiness * 0.02);

    // 3. Crisp Wet Squelch Noise Bursts
    // Mid air-cavity pop
    this.playNoise(0.07 + stickiness * 0.015, 0.45, 1400 - stickiness * 80, 'bandpass', 3.0);
    // High-frequency wet finger separation sizzle
    this.playNoise(0.04, 0.35, 4500, 'highpass', 1.5);

    // 4. For high stickiness: trailing gooey suction pop micro-click
    if (stickiness >= 4) {
      setTimeout(() => {
        if (!this.ctx || this.muted) return;
        this.playNoise(0.03, 0.3, 2200, 'bandpass', 4.0);
      }, 40);
    }
  }

  // Ultra-Crispy ASMR Bingsu / Crunchy Slime Sound
  // Flurry of rapid acrylic bead clacks, crispy bubble snaps, and plastic crunches
  playBingsuCrunch() {
    if (this.muted || !this.ctx) return;
    const numCrackles = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numCrackles; i++) {
      const delay = i * (12 + Math.random() * 14);
      setTimeout(() => {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;

        // High-Q crunchy bead clack noise
        const freq = 1800 + Math.random() * 3800;
        this.playNoise(0.025, 0.45, freq, 'bandpass', 4.5);

        // High-frequency crystal snap click
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'triangle';
        const clickFreq = 2400 + Math.random() * 1600;
        clickOsc.frequency.setValueAtTime(clickFreq, now);
        clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.018);

        clickGain.gain.setValueAtTime(0.35, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        clickOsc.connect(clickGain);
        clickGain.connect(this.masterGain);
        clickOsc.start(now);
        clickOsc.stop(now + 0.022);
      }, delay);
    }

    // Underlying tactile squish body
    this.playNoise(0.06, 0.4, 900, 'lowpass');
  }

  // Coin earned chime
  playCoinSound() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Purchase unlocked fanfare
  playBuySound() {
    if (this.muted || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
      }, idx * 60);
    });
  }

  // Floam crunchy micro-foam bead popping sound
  playFoamCrunch() {
    if (this.muted || !this.ctx) return;
    const crackles = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < crackles; i++) {
      setTimeout(() => {
        if (!this.ctx || this.muted) return;
        this.playNoise(0.035, 0.48, 1600 + Math.random() * 1400, 'bandpass', 3.5);
      }, i * 20);
    }
    this.playNoise(0.08, 0.38, 750, 'lowpass');
  }

  // Cloud Slime soft airy puff & drizzle sound
  playCloudPuff() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

    gain.gain.setValueAtTime(0.48, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.26);

    // Soft airy rush mist
    this.playNoise(0.14, 0.38, 850, 'bandpass', 1.8);
    this.playNoise(0.08, 0.25, 2400, 'highpass', 1.0);
  }

  // Sticky suction release pop (when hover un-sticks or stretch snaps back)
  playStickRelease(stickiness = 3) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = 75 + (5 - stickiness) * 25;
    const peakFreq = 340 + (5 - stickiness) * 70;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.035);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.12);

    gain.gain.setValueAtTime(0.72, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);

    // Wet suction pop noise burst
    this.playNoise(0.05, 0.52, 1400 - stickiness * 80, 'bandpass', 3.0);
    this.playNoise(0.03, 0.42, 3800, 'highpass', 1.5);
  }

  // Taffy gooey stretching sound with tensile fibers
  playStretch(amount = 1.0) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const f = 140 + Math.min(320, amount * 140);
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.linearRampToValueAtTime(f + 70, now + 0.10);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.13);

    // Subtle viscoelastic tensile friction noise
    this.playNoise(0.06, 0.25, 1600, 'bandpass', 2.0);
  }

  // Crisp resonant air bubble pop
  playBubblePop() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);

    this.playNoise(0.04, 0.55, 2600, 'bandpass', 3.5);
  }
}

window.slimeAudio = new SlimeAudio();
