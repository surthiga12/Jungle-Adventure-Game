export class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: { [key: string]: string } = {};

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  private async initAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  playSuccessSound() {
    this.playTone([523.25, 659.25, 783.99], 0.3, 'sine'); // C-E-G chord
  }

  playErrorSound() {
    this.playTone([220, 196], 0.5, 'sawtooth'); // A-G down
  }

  playPlantSound() {
    this.playTone([392], 0.2, 'triangle'); // G note
  }

  playWaterSound() {
    // Water sound simulation
    this.playNoise(0.1, 0.3);
  }

  playGrowSound() {
    this.playTone([261.63, 329.63, 392], 0.4, 'sine'); // C-E-G ascending
  }

  playNote(note: string) {
    const frequencies: { [key: string]: number } = {
      'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23,
      'G': 392.00, 'A': 440.00, 'B': 493.88
    };
    
    const frequency = frequencies[note];
    if (frequency) {
      this.playTone([frequency], 0.5, 'sine');
    }
  }

  playLevelComplete() {
    // Victory fanfare
    const melody = [523.25, 587.33, 659.25, 698.46, 783.99]; // C-D-E-F-G
    this.playMelody(melody, 0.15);
  }

  playCrystalSound() {
    // Crystal collection sound - magical chime
    this.playTone([523.25, 659.25, 783.99, 1046.5], 0.3, 'sine'); // C-E-G-C octave
  }

  playPowerUpSound() {
    // Power-up collection sound - ascending magical tone
    this.playTone([392, 523.25, 659.25, 783.99], 0.2, 'triangle'); // G-C-E-G
  }

  playSwitchSound() {
    // Switch activation sound - mechanical click
    this.playTone([220, 440], 0.1, 'square'); // A octave
  }

  playTeleportSound() {
    // Teleport sound - whoosh effect
    this.playTone([880, 440, 220], 0.4, 'sawtooth'); // Descending whoosh
  }

  playShieldSound() {
    // Shield activation - protective hum
    this.playTone([329.63, 392, 523.25], 0.5, 'triangle'); // E-G-C
  }

  private async playTone(frequencies: number[], duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return;
    
    await this.initAudioContext();

    frequencies.forEach((frequency, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext!.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      const startTime = this.audioContext!.currentTime + (index * 0.1);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  private async playMelody(frequencies: number[], noteDuration: number) {
    if (!this.audioContext) return;
    
    await this.initAudioContext();

    frequencies.forEach((frequency, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext!.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + noteDuration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      const startTime = this.audioContext!.currentTime + (index * noteDuration);
      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration);
    });
  }

  private async playNoise(duration: number, volume: number) {
    if (!this.audioContext) return;
    
    await this.initAudioContext();

    const bufferSize = this.audioContext.sampleRate * duration;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    whiteNoise.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    whiteNoise.start(this.audioContext.currentTime);
    whiteNoise.stop(this.audioContext.currentTime + duration);
  }
}
