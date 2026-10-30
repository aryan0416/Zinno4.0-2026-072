/**
 * SafeRoute-AI // Tactical Web Audio API Synthesizer
 * Generates mission-control alert tones, radar chirps, and warning sirens
 * with zero external audio assets or network dependencies.
 */

class TacticalAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setEnabled(val) {
    this.enabled = val;
    if (val) this.init();
  }

  /** Low-frequency urgent hazard alert tone when incident/blockage is tripped */
  playHazardAlarm() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Dual oscillator alarm: primary saw + sub sine
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Pulse 1
      osc1.frequency.setValueAtTime(820, now);
      osc1.frequency.exponentialRampToValueAtTime(420, now + 0.22);
      osc2.frequency.setValueAtTime(180, now);
      osc2.frequency.exponentialRampToValueAtTime(110, now + 0.22);

      // Pulse 2
      osc1.frequency.setValueAtTime(820, now + 0.28);
      osc1.frequency.exponentialRampToValueAtTime(420, now + 0.50);
      osc2.frequency.setValueAtTime(180, now + 0.28);
      osc2.frequency.exponentialRampToValueAtTime(110, now + 0.50);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.56);
      osc2.stop(now + 0.56);
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  }

  /** High-tech tactical radar chirp */
  playRadarChirp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.095);
    } catch (e) {
      console.warn('Radar chirp failed:', e);
    }
  }

  /** Positive ascending resolution chime when incident is cleared */
  playClearChirp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.07 + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + (idx + 1) * 0.07 + 0.09);
      });
    } catch (e) {
      console.warn('Clear chime failed:', e);
    }
  }

  /** Ambulance dispatch triple beacon pulse */
  playAmbulanceDispatch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.12, 0.24].forEach((delay) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(960, now + delay);
        osc.frequency.exponentialRampToValueAtTime(640, now + delay + 0.09);

        gain.gain.setValueAtTime(0.14, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.10);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.11);
      });
    } catch (e) {
      console.warn('Ambulance tone failed:', e);
    }
  }
}

export const tacticalAudio = new TacticalAudioEngine();
