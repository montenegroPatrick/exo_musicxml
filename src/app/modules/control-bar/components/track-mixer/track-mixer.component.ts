import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AudioService } from '@core/services/audio.service';
import { FaderComponent } from '../fader/fader.component';

@Component({
  selector: 'app-track-mixer',
  imports: [ButtonModule, FaderComponent],
  template: `
    <p-button
      icon="pi pi-sliders-v"
      [text]="true"
      styleClass="text-white!"
      (onClick)="toggleMixer()"
      pTooltip="Mixer"
    />
    @if (isOpen()) {
      <div
        class="absolute bottom-15 left-0 right-0 bg-black/35 backdrop-blur-xl rounded- p-6"
      >
        <div class="flex gap-8 justify-start">
          @for (track of tracks(); track track.name; let i = $index) {
            <div class="flex flex-col items-center gap-3">
              <app-fader
                [value]="track.volume * 100"
                (valueChange)="onTrackVolumeChange(i, $event)"
              />
              <span
                class="text-sm text-white/90 max-w-20 text-center truncate font-medium"
              >
                {{ track.label }}
              </span>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: ``,
})
export class TrackMixerComponent {
  private _audioService = inject(AudioService);

  isOpen = signal(false);
  tracks = computed(() => this._audioService.audioTracks());

  toggleMixer() {
    this.isOpen.update((v) => !v);
  }

  onTrackVolumeChange(trackIndex: number, value: number) {
    this._audioService.setTrackVolume(trackIndex, value / 100);
  }
}
