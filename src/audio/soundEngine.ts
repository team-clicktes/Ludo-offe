/**
 * Local Web Audio API Sound & Music Engine (100% offline, zero external audio files).
 */
class LudoSoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = false;
  private musicTimer: number | null = null;
  private musicStep = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusicLoop();
    } else {
      this.stopMusicLoop();
    }
  }

  public unlock(): void {
    this.ensureContext();
    if (this.musicEnabled && this.musicTimer === null) {
      this.startMusicLoop();
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.14,
    delay = 0,
    slideToFreq?: number
  ): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideToFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.playTone(620, 0.06, 'triangle', 0.09, 0, 440);
  }

  public playDiceRoll(): void {
    if (!this.soundEnabled) return;
    // Crisp percussive dice rattle sequence
    const pitches = [310, 440, 360, 520, 390, 610];
    pitches.forEach((p, idx) => {
      this.playTone(p, 0.055, 'triangle', 0.08, idx * 0.065, p * 0.85);
    });
  }

  public playHop(stepIndex = 0): void {
    const base = 420 + (stepIndex % 6) * 38;
    this.playTone(base, 0.085, 'sine', 0.12, 0, base * 1.18);
  }

  public playSpawn(): void {
    this.playTone(392, 0.12, 'triangle', 0.14, 0);
    this.playTone(587.33, 0.16, 'triangle', 0.14, 0.08);
  }

  public playCapture(): void {
    this.playTone(260, 0.14, 'sawtooth', 0.15, 0, 110);
    this.playTone(175, 0.24, 'square', 0.12, 0.09, 75);
  }

  public playSafeLand(): void {
    this.playTone(523.25, 0.12, 'sine', 0.12, 0);
    this.playTone(783.99, 0.18, 'sine', 0.11, 0.07);
  }

  public playGoalReach(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.18, 'triangle', 0.15, i * 0.075);
    });
  }

  public playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.25, 'triangle', 0.16, i * 0.1);
    });
  }

  public playTurnPass(): void {
    this.playTone(330, 0.09, 'sine', 0.08, 0, 270);
  }

  private startMusicLoop(): void {
    if (typeof window === 'undefined' || this.musicTimer !== null) return;
    // Gentle royal pentatonic arpeggio loop
    const melody = [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 293.66];
    this.musicTimer = window.setInterval(() => {
      if (!this.musicEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx || ctx.state !== 'running') return;

      const freq = melody[this.musicStep % melody.length];
      this.musicStep += 1;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.032, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }, 520);
  }

  public stopMusicLoop(): void {
    if (this.musicTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const soundEngine = new LudoSoundEngine();
