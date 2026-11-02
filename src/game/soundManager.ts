// Web Audio API Synthesizer for Retro Neon Sound Effects & Ambient Pulse

class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isSfxMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private sfxVolume: number = 0.5;
  private musicVolume: number = 0.25;
  private musicTimer: number | null = null;
  private musicStep: number = 0;
  private isInitialized: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser policies
  }

  private initContext() {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isSfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMusicMuted ? 0 : this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch {
      // AudioContext not supported
    }
  }

  public userInteraction() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSfxMuted(muted: boolean) {
    this.isSfxMuted = muted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(muted ? 0 : this.musicVolume, this.ctx.currentTime);
    }
    if (muted) {
      this.stopMusic();
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx && !this.isSfxMuted) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx && !this.isMusicMuted) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public getSfxMuted(): boolean {
    return this.isSfxMuted;
  }

  public getMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  // --- Sound Effects ---

  public playMove() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playRotate() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.07);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playSoftDrop() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.03);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  public playHardDrop() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Sub punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);

    // Laser transient snap
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(950, now);
    snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

    snapGain.gain.setValueAtTime(0.2, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    snapOsc.connect(snapGain);
    snapGain.connect(this.sfxGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.06);
  }

  public playLock() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playHold() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0.12, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.1);
    });
  }

  public playLineClear(lines: number) {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Chords based on lines cleared
    let freqs: number[] = [440, 554.37]; // Single: A4, C#5
    if (lines === 2) freqs = [440, 554.37, 659.25]; // Double: A major triad
    if (lines === 3) freqs = [440, 554.37, 659.25, 830.61]; // Triple: A maj7
    if (lines >= 4) {
      this.playTetris();
      return;
    }

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);

      gain.gain.setValueAtTime(0.15, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 0.25);
    });
  }

  public playTetris() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Bass sweep
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(110, now);
    bass.frequency.exponentialRampToValueAtTime(55, now + 0.4);

    bassGain.gain.setValueAtTime(0.25, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    bass.connect(bassGain);
    bassGain.connect(this.sfxGain);
    bass.start(now);
    bass.stop(now + 0.4);

    // Euphoric ascending neon synth chord sequence (E5, G#5, B5, E6)
    const chord = [659.25, 830.61, 987.77, 1318.51];
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.2, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.45);
    });
  }

  public playLevelUp() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.3);
    });
  }

  public playGameOver() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.6);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // --- Background Synth Pulse ---

  public startMusic() {
    if (this.isMusicMuted || this.musicTimer !== null) return;
    this.initContext();

    const bpm = 120;
    const stepDurationMs = (60 / bpm / 2) * 1000; // 8th notes (250ms)

    // Bassline notes progression (A minor cyber loop: A1, C2, D2, F1, E1)
    const bassline = [
      55, 55, 110, 55,
      65.41, 65.41, 130.81, 65.41,
      73.42, 73.42, 146.83, 73.42,
      82.41, 73.42, 65.41, 55
    ];

    const padChords = [
      [220, 261.63, 329.63], // Am
      [174.61, 220, 261.63], // F
      [196, 246.94, 293.66], // G
      [164.81, 207.65, 246.94] // Em
    ];

    this.musicTimer = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMusicMuted) return;

      const now = this.ctx.currentTime;
      const noteIdx = this.musicStep % bassline.length;
      const baseFreq = bassline[noteIdx];

      // Bass pulse
      const bass = this.ctx.createOscillator();
      const bassFilter = this.ctx.createBiquadFilter();
      const bGain = this.ctx.createGain();

      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(baseFreq, now);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(260 + Math.sin(this.musicStep * 0.2) * 120, now);

      bGain.gain.setValueAtTime(0.09, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      bass.connect(bassFilter);
      bassFilter.connect(bGain);
      bGain.connect(this.musicGain);

      bass.start(now);
      bass.stop(now + 0.22);

      // Subtle atmospheric pad every 8 steps
      if (this.musicStep % 8 === 0) {
        const chordIdx = Math.floor((this.musicStep % 32) / 8);
        const chordNotes = padChords[chordIdx];
        chordNotes.forEach(freq => {
          if (!this.ctx || !this.musicGain) return;
          const pad = this.ctx.createOscillator();
          const pFilter = this.ctx.createBiquadFilter();
          const pGain = this.ctx.createGain();

          pad.type = 'sine';
          pad.frequency.setValueAtTime(freq, now);

          pFilter.type = 'lowpass';
          pFilter.frequency.setValueAtTime(600, now);

          pGain.gain.setValueAtTime(0.02, now);
          pGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

          pad.connect(pFilter);
          pFilter.connect(pGain);
          pGain.connect(this.musicGain);

          pad.start(now);
          pad.stop(now + 1.8);
        });
      }

      this.musicStep++;
    }, stepDurationMs);
  }

  public stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.musicStep = 0;
  }
}

export const soundManager = new SoundManager();
