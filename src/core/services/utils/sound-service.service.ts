import { inject, Injectable } from '@angular/core';
import { ExerciseStateService } from '../../../app/flat/services/exercise-state.service';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private exerciseState = inject(ExerciseStateService);
  audioContext = new AudioContext();
  noiseBuffer: AudioBuffer | null = null;
  initAudioContext = () => {
    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Create noise buffer for clap sound (white noise)
    const bufferSize = this.audioContext.sampleRate * 0.5; // 0.5 seconds
    this.noiseBuffer = this.audioContext.createBuffer(
      1,
      bufferSize,
      this.audioContext.sampleRate
    );
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1; // White noise: random values between -1 and 1
    }
  };

  playTapSound = () => {
    // Ensure audio context is running
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (!this.noiseBuffer) return;

    const currentTime = this.audioContext.currentTime;

    // Create buffer source with white noise
    const noise = this.audioContext.createBufferSource();
    noise.buffer = this.noiseBuffer;

    // High-pass filter for clap character (removes low frequencies)
    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 1000; // Cut frequencies below 1000 Hz

    // Band-pass filter to shape the clap sound
    const bandpass = this.audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 3000; // Center frequency
    bandpass.Q.value = 1; // Bandwidth

    // Gain node for volume control and envelope
    const gainNode = this.audioContext.createGain();
    const volume = this.exerciseState.tapVolume() / 100;
    if (volume === 0) return;

    // Clap envelope: very fast attack, quick decay
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 1.5, currentTime + 0.001); // 1ms attack (very sharp)
    gainNode.gain.exponentialRampToValueAtTime(
      volume * 0.3,
      currentTime + 0.02
    ); // First decay
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1); // Final decay (100ms total)

    // Connect nodes: noise -> highpass -> bandpass -> gain -> destination
    noise.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Play clap sound
    noise.start(currentTime);
    noise.stop(currentTime + 0.1); // 100ms duration

    // Clean up
    noise.onended = () => {
      noise.disconnect();
      highpass.disconnect();
      bandpass.disconnect();
      gainNode.disconnect();
    };
  };
}
