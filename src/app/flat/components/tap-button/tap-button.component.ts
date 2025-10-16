import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
import { IUserTap } from '../../models/tap.model';
import { ExerciseStateService } from '@app/services/exercise-state.service';

@Component({
  selector: 'app-tap-button',
  standalone: true,
  template: `
    <div #tapButton [class]="class()" (click)="handleTap()">
      <!-- @if (lastTap() && showFeedback()) {
      <p class="text-center text-sm">
        @switch(lastTap()?.result) { @case('Good') { } @case('Too early') {
        <span>En avance de </span>
        } @case('Too late') {
        <span>En retard de </span>
        } } {{ lastTap()?.diffMs }} ms
      </p>
      } -->

      <!-- <button
        #tapButton
        label="TAP"
        icon="pi pi-fingerprint"
        class="h-30 w-65 md:w-100 md:h-75 lg:w-130 lg:h-75 rounded-sm text-xl text-secondary shadow-lg   transition-transform flex flex-col gap-2 items-center justify-center"
        [disabled]="disabled()"
        (click)="handleTap()"
      >
        <p class="select-none">TAP</p>
        @if(screenWidth() > 800) {
        <span class="text-sm select-none"
          >Vous pouvez utiliser la barre espace</span
        >
        }
      </button> -->

      <ng-content></ng-content>
    </div>
  `,
})
export class TapButtonComponent implements OnInit {
  private exerciseState = inject(ExerciseStateService);
  disabled = input<boolean>(false);
  lastTap = input<IUserTap | null>(null);
  showFeedback = input<boolean>(true);
  tap = output<void>();
  class = input<string>('');
  tapButton = viewChild<ElementRef<HTMLButtonElement>>('tapButton');
  screenWidth = computed(() => window.innerWidth);
  audioContext = new AudioContext();
  noiseBuffer: AudioBuffer | null = null;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Space' && !this.disabled()) {
      event.preventDefault();
      const button = this.tapButton();
      if (button) {
        button.nativeElement.click();
      }
    }
  }

  ngOnInit(): void {
    this.initAudioContext();
  }

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

  handleTap = () => {
    if (!this.disabled()) {
      this.playTapSound();
      this.tap.emit();
    }
  };
}
