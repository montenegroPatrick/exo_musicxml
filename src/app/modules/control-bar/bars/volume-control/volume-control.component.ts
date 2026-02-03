import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { FaderComponent } from '../../components/fader/fader.component';

@Component({
  selector: 'app-volume-control',
  imports: [ButtonModule, SliderModule, FormsModule, FaderComponent],
  template: `
    <div class="relative">
      <p-button
        [icon]="volumeIcon()"
        [text]="true"
        size="small"
        styleClass="text-white!"
        (onClick)="handleToggleVolumeSliderView()"
      />
      @if (!hidden()) {
        <div class="absolute bg-gray-500/50 bottom-15 right-0 rounded-lg p-2">
          <app-fader
            [(value)]="volume"
            orientation="vertical"
            (valueChange)="onVolumeChange($event)"
            class="w-24"
          />
        </div>
      }
    </div>
  `,
})
export class VolumeControlComponent {
  volume = signal<number>(100);
  isMuted = signal<boolean>(false);
  private previousVolume = 100;

  volumeChange = output<number>();
  muteChange = output<boolean>();

  hidden = signal<boolean>(true);

  volumeIcon() {
    if (this.isMuted() || this.volume() === 0) {
      return 'pi pi-volume-off';
    } else if (this.volume() < 50) {
      return 'pi pi-volume-down';
    } else {
      return 'pi pi-volume-up';
    }
  }
  handleToggleVolumeSliderView() {
    this.hidden.set(!this.hidden());
  }

  toggleMute() {
    if (this.isMuted()) {
      this.isMuted.set(false);
      this.volume.set(this.previousVolume);
      this.volumeChange.emit(this.previousVolume);
    } else {
      this.previousVolume = this.volume();
      this.isMuted.set(true);
      this.volume.set(0);
      this.volumeChange.emit(0);
    }
    this.muteChange.emit(this.isMuted());
  }

  onVolumeChange(value: number) {
    this.volume.set(value);
    if (value > 0) {
      this.isMuted.set(false);
    }
    this.volumeChange.emit(value);
  }
}
