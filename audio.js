// Planet Saver - Procedural Realistic Sci-Fi Audio & Synthesizer Engine
// Includes realistic military radio chatter, alien bio-screeches, kinetic weapons, and rescue chimes

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.isMuted = false;
    this.masterVolume = 0.7;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.5;

    this.currentTrack = null;
    this.musicTimer = null;
    this.musicStep = 0;
    this.bpm = 120;
    this.isPlayingMusic = false;

    // Load saved preferences
    try {
      const savedMute = localStorage.getItem('ps_muted');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
      const savedVol = localStorage.getItem('ps_master_vol');
      if (savedVol !== null) this.masterVolume = parseFloat(savedVol);
    } catch (e) {}
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
    try { localStorage.setItem('ps_master_vol', this.masterVolume.toString()); } catch(e){}
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    try { localStorage.setItem('ps_muted', this.isMuted.toString()); } catch(e){}
    return this.isMuted;
  }

  createNoiseBuffer(duration = 0.5) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Realistic Military Radio Squelch Click
  playRadioSquelch() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.04);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  // Human Colonist Rescued Chime ("Airlock secure!")
  playHumanRescued() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - high C
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.32);
    });
  }

  // Human Abduction Alarm / Colonist Distress
  playHumanDistress() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1400, now + 0.15);
    osc.frequency.linearRampToValueAtTime(900, now + 0.3);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Alien Insectoid Screech / Hive Roar
  playAlienScreech() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(850, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.45);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(8, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.48);
  }

  // Alien Acid Spit / Bio-Plasma Splash
  playAcidSpit() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.22);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.22);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  // Human Military Kinetic Railgun / Laser
  playLaser(isPlayer = true) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isPlayer ? 'sawtooth' : 'triangle';
    const startFreq = isPlayer ? 920 : 420;
    const endFreq = isPlayer ? 220 : 80;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.11);

    gain.gain.setValueAtTime(isPlayer ? 0.22 : 0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Realistic Missile Rocket Launch
  playMissile() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.35);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.35);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  // Explosions with realistic acoustic decay
  playExplosion(scale = 1.0) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const duration = 0.4 * Math.sqrt(scale);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(duration);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500 * scale, now);
    filter.frequency.exponentialRampToValueAtTime(30, now + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(Math.min(0.65, 0.35 * scale), now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);

    // Deep sub bass thump
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(110 * scale, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + duration);
    subGain.gain.setValueAtTime(Math.min(0.5, 0.3 * scale), now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + duration + 0.05);
  }

  // Energy Shield Deflection
  playShieldHit() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  // EMP Shockwave
  playEmp() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.65);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.65);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.7);
  }

  // Interplanetary Earth Burn / Warp
  playWarp() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(90, now + 1.8);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.85);
  }

  playUIClick() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.04);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playTransmissionBeep() {
    this.playRadioSquelch();
  }

  playPickup() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.setValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playVictory() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.16, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.42);
    });
  }

  playWarning() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(680, now + 0.2);
    osc.frequency.linearRampToValueAtTime(440, now + 0.4);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.46);
  }

  // ==========================================
  // PROCEDURAL MUSIC TRACKS
  // ==========================================
  startMusic(theme = 'earth') {
    this.init();
    if (this.currentTrack === theme && this.isPlayingMusic) return;
    this.stopMusic();

    this.currentTrack = theme;
    this.isPlayingMusic = true;
    this.musicStep = 0;

    if (theme === 'earth' || theme === 'hq') {
      this.bpm = 80;
      this.playEarthTheme();
    } else if (theme === 'combat') {
      this.bpm = 128;
      this.playCombatTheme();
    } else if (theme === 'boss') {
      this.bpm = 140;
      this.playAlienBossTheme();
    }
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  // Earth Command Ambient Theme (majestic, cinematic, human space exploration)
  playEarthTheme() {
    if (!this.isPlayingMusic || !this.ctx || (this.currentTrack !== 'earth' && this.currentTrack !== 'hq')) return;
    const stepDuration = 60 / this.bpm / 2;
    const now = this.ctx.currentTime;

    const chords = [
      [130.81, 196.00, 261.63, 329.63], // C major
      [110.00, 164.81, 220.00, 261.63], // A minor
      [87.31, 130.81, 174.61, 220.00],  // F major
      [98.00, 146.83, 196.00, 246.94]   // G major
    ];

    const chordIdx = Math.floor(this.musicStep / 8) % chords.length;
    const chord = chords[chordIdx];
    const freq = chord[this.musicStep % chord.length];

    if (!this.isMuted) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + stepDuration * 2);

      // Deep earth drone every 16 steps
      if (this.musicStep % 16 === 0) {
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'triangle';
        sub.frequency.setValueAtTime(chord[0] / 2, now);
        subGain.gain.setValueAtTime(0.12, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 14);
        sub.connect(subGain);
        subGain.connect(this.musicGain);
        sub.start(now);
        sub.stop(now + stepDuration * 15);
      }
    }

    this.musicStep++;
    this.musicTimer = setTimeout(() => this.playEarthTheme(), stepDuration * 1000);
  }

  // Planetary Combat Theme
  playCombatTheme() {
    if (!this.isPlayingMusic || !this.ctx || this.currentTrack !== 'combat') return;
    const stepDuration = 60 / this.bpm / 4;
    const now = this.ctx.currentTime;
    const step = this.musicStep % 16;

    const bassNotes = [
      73.42, 73.42, 146.83, 73.42, 98.00, 73.42, 110.00, 73.42,
      73.42, 73.42, 146.83, 73.42, 87.31, 73.42, 98.00, 110.00
    ];

    if (!this.isMuted) {
      // Bass
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassNotes[step], now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750 + Math.sin(this.musicStep * 0.25) * 350, now);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + stepDuration);

      // Kick drum on beats 0, 4, 8, 12
      if (step % 4 === 0) {
        const kick = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(150, now);
        kick.frequency.exponentialRampToValueAtTime(36, now + 0.1);
        kGain.gain.setValueAtTime(0.3, now);
        kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        kick.connect(kGain);
        kGain.connect(this.musicGain);
        kick.start(now);
        kick.stop(now + 0.13);
      }

      // Snare on 4, 12
      if (step === 4 || step === 12) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.12);
        const sFilter = this.ctx.createBiquadFilter();
        sFilter.type = 'bandpass';
        sFilter.frequency.setValueAtTime(1500, now);
        const sGain = this.ctx.createGain();
        sGain.gain.setValueAtTime(0.16, now);
        sGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        noise.connect(sFilter);
        sFilter.connect(sGain);
        sGain.connect(this.musicGain);
        noise.start(now);
        noise.stop(now + 0.13);
      }
    }

    this.musicStep++;
    this.musicTimer = setTimeout(() => this.playCombatTheme(), stepDuration * 1000);
  }

  // Alien Hive Mother Boss Theme
  playAlienBossTheme() {
    if (!this.isPlayingMusic || !this.ctx || this.currentTrack !== 'boss') return;
    const stepDuration = 60 / this.bpm / 4;
    const now = this.ctx.currentTime;
    const step = this.musicStep % 16;

    const bossNotes = [55.00, 58.27, 55.00, 61.74, 55.00, 51.91, 55.00, 65.41];
    const freq = bossNotes[step % bossNotes.length];

    if (!this.isMuted) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.Q.setValueAtTime(6, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 0.95);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + stepDuration);

      if (step % 2 === 0) {
        const kick = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(180, now);
        kick.frequency.exponentialRampToValueAtTime(28, now + 0.1);
        kGain.gain.setValueAtTime(0.35, now);
        kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        kick.connect(kGain);
        kGain.connect(this.musicGain);
        kick.start(now);
        kick.stop(now + 0.13);
      }
    }

    this.musicStep++;
    this.musicTimer = setTimeout(() => this.playAlienBossTheme(), stepDuration * 1000);
  }
}

window.soundEngine = new SoundEngine();
