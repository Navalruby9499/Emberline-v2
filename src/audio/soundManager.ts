/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API procedural sound and music synthesizer for 16-bit retro fidelity
class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private currentTrack: string | null = null;
  private isBgmPlaying = false;
  private bgmIntervalId: number | null = null;
  private sfxVolume = 0.8;
  private bgmVolume = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolumes(sfx: number, bgm: number) {
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.bgmVolume = Math.max(0, Math.min(1, bgm));

    if (this.ctx && this.sfxGain && this.bgmGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  // --- SOUND EFFECTS ---

  public playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playSlash(combo = 1) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = combo === 3 ? 'sawtooth' : 'triangle';
    const baseFreq = combo === 1 ? 300 : combo === 2 ? 400 : 550;
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, this.ctx.currentTime + 0.14);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800 + combo * 300, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);
  }

  public playCrescent() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  public playOverheat() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.setValueAtTime(180, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playDash() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  public playHit() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playEnemyDeath() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  public playSpark() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1320, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playCyclone() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.7);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.75);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.75);
  }

  public playBeaconIgnite() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    // Arpeggio chime
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.4);
    });
  }

  public playBossTelegraph() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playRescue() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.09);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(this.ctx.currentTime + i * 0.09);
      osc.stop(this.ctx.currentTime + i * 0.09 + 0.35);
    });
  }

  public playDialogueBeep() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playLevelUp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume === 0) return;

    // Triumphant 16-bit RPG Level-Up Fanfare
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i >= 4 ? 'triangle' : 'square';
      const startTime = this.ctx.currentTime + i * 0.075;
      const duration = i === notes.length - 1 ? 0.55 : 0.25;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  // --- BACKGROUND MUSIC GENERATOR (Authentic 16-bit Synthesizer) ---

  public playMusic(theme: 'title' | 'forge' | 'exploration' | 'boss' | 'dawn') {
    this.initContext();
    if (this.currentTrack === theme && this.isBgmPlaying) return;
    this.stopMusic();

    this.currentTrack = theme;
    this.isBgmPlaying = true;

    let step = 0;
    const bpm = theme === 'boss' ? 140 : theme === 'dawn' ? 76 : 108;
    const stepInterval = (60 / bpm / 2) * 1000;

    // Progression scales
    const noteMap: Record<string, number> = {
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00
    };

    const bossMelody = ['A3', 'C4', 'D4', 'E4', 'G4', 'E4', 'D4', 'C4', 'A3', 'D4', 'C4', 'B3', 'A3', 'A3', 'E4', 'D4'];
    const exploreMelody = ['C4', 'E4', 'G4', 'B4', 'A4', 'G4', 'E4', 'D4', 'C4', 'D4', 'E4', 'G4', 'F4', 'E4', 'D4', 'C4'];
    const forgeMelody = ['D4', 'F4', 'A4', 'G4', 'F4', 'D4', 'C4', 'D4', 'F4', 'G4', 'A4', 'C5', 'A4', 'G4', 'F4', 'D4'];
    const dawnMelody = ['F4', 'A4', 'C5', 'E5', 'D5', 'C5', 'A4', 'F4', 'G4', 'B4', 'D5', 'C5', 'A4', 'F4', 'G4', 'F4'];
    const titleMelody = ['A4', 'C5', 'E5', 'D5', 'C5', 'A4', 'B4', 'G4', 'A4', 'C5', 'D5', 'E5', 'F5', 'E5', 'D5', 'C5'];

    const chosenMelody = 
      theme === 'boss' ? bossMelody :
      theme === 'forge' ? forgeMelody :
      theme === 'dawn' ? dawnMelody :
      theme === 'title' ? titleMelody : exploreMelody;

    this.bgmIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.bgmGain || !this.isBgmPlaying || this.bgmVolume === 0) return;

      const note = chosenMelody[step % chosenMelody.length];
      const freq = noteMap[note] || 440;

      // Lead voice
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = theme === 'boss' ? 'sawtooth' : theme === 'dawn' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const noteDuration = (stepInterval / 1000) * 0.8;
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + noteDuration);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start();
      osc.stop(this.ctx.currentTime + noteDuration);

      // Bass drone every 4 steps
      if (step % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(freq / 2, this.ctx.currentTime);
        bassGain.gain.setValueAtTime(0.09, this.ctx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (stepInterval / 1000) * 1.8);
        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);
        bassOsc.start();
        bassOsc.stop(this.ctx.currentTime + (stepInterval / 1000) * 1.8);
      }

      step++;
    }, stepInterval);
  }

  public stopMusic() {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.isBgmPlaying = false;
    this.currentTrack = null;
  }
}

export const soundManager = new SoundManager();
