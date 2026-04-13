import { Component, input, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { AudioService } from '@core/services/audio.service';
import { KnobComponent } from '../knob/knob.component';
import { AudioMeterComponent } from '../audio-meter/audio-meter.component';

@Component({
  selector: 'app-mixer-channel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SliderModule, KnobComponent, AudioMeterComponent],
  templateUrl: './mixer-channel.component.html',
  styleUrls: ['./mixer-channel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MixerChannelComponent {
  // -- New Input API --
  trackIndex = input<number>();
  label = input.required<string>();
  isMaster = input<boolean>(false);

  private _audioService = inject(AudioService);

  /** Computed reference to the track object in the service */
  track = computed(() => {
    const idx = this.trackIndex();
    if (this.isMaster() || idx === undefined) return null;
    return this._audioService.audioTracks()[idx];
  });

  /** Computed analyser node for the meter */
  analyserNode = computed(() => {
    if (this.isMaster()) return this._audioService.masterAnalyser();
    return this.track()?.analyserNode;
  });

  /** Computed track color for the label strip */
  trackLabelColor = computed(() => {
    if (this.isMaster()) return '#27272a'; // Zinc 800
    const lbl = this.label().toLowerCase();
    if (lbl.includes('inst')) return '#166534';
    if (lbl.includes('audio')) return '#1e40af';
    return '#3f3f46';
  });

  // Volume & Pan (Getters/Setters for [(ngModel)] binding)
  get volume(): number {
    if (this.isMaster()) {
      return this._audioService.masterVolume();
    }
    return (this.track()?.volume ?? 0) * 100;
  }

  set volume(val: number) {
    if (this.isMaster()) {
      this._audioService.setVolume(val);
    } else {
      const idx = this.trackIndex();
      if (idx !== undefined) {
        this._audioService.setTrackVolume(idx, val / 100);
      }
    }
  }

  get pan(): number {
    return this.track()?.pan ?? 0;
  }

  set pan(val: number) {
    const idx = this.trackIndex();
    if (idx !== undefined) {
      this._audioService.setTrackPan(idx, val);
    }
  }

  toggleMute() {
    if (!this.isMaster()) {
      const idx = this.trackIndex();
      if (idx !== undefined) this._audioService.toggleMute(idx);
    }
  }

  toggleSolo() {
    if (!this.isMaster()) {
      const idx = this.trackIndex();
      if (idx !== undefined) this._audioService.toggleSolo(idx);
    }
  }
}
