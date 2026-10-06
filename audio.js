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
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    localStorage.setItem('slime_sound_muted', this.muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
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

  // Helper: filtered noise burst
  playNoise(duration = 0.1, volume = 0.2, filterFreq = 1000) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  // ASMR Interactive Slime Poke / Squish Sound
  playASMRSquish(stickiness = 3) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Stickiness alters pitch sweep and duration: higher stickiness = lower gooier suction pop
    const baseFreq = Math.max(90, 240 - stickiness * 28);
    osc.type = stickiness > 3 ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * (1.2 + stickiness * 0.2), now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.12 + stickiness * 0.02);

    const vol = Math.min(0.5, 0.25 + stickiness * 0.05);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14 + stickiness * 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.18 + stickiness * 0.02);

    // Wet squishy pop noise
    this.playNoise(0.05 + stickiness * 0.015, 0.25, 900 - stickiness * 80);
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

    gain.gain.setValueAtTime(0.3, now);
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
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
      }, idx * 60);
    });
  }

  // Floam crunchy bubbly sound
  playFoamCrunch() {
    if (this.muted || !this.ctx) return;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.playNoise(0.03, 0.2, 1400 + Math.random() * 800);
      }, i * 25);
    }
  }

  // Cloud Slime soft airy puff sound
  playCloudPuff() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
    this.playNoise(0.08, 0.15, 600);
  }

  // Sticky suction release pop (when hover un-sticks or stretch snaps back)
  playStickRelease(stickiness = 3) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = 80 + (5 - stickiness) * 25;
    const peakFreq = 260 + (5 - stickiness) * 60;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.11);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.14);

    // Wet suction click
    this.playNoise(0.04, 0.22, 1100 - stickiness * 90);
  }

  // Taffy stretching sound
  playStretch(amount = 1.0) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const f = 150 + Math.min(300, amount * 120);
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.linearRampToValueAtTime(f + 60, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }
}

window.slimeAudio = new SlimeAudio();
