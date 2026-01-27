import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'app-volume-control',
  imports: [ButtonModule, SliderModule, FormsModule],
  template: `
    <div class="relative">
      <p-button
        [icon]="volumeIcon()"
        [text]="true"
        severity="secondary"
        (onClick)="handleToggleVolumeSliderView()"
      />
      @if (!hidden()) {
        <div class="absolute  bottom-15 left-4 ">
          <p-slider
            [(ngModel)]="volume"
            [max]="100"
            [min]="0"
            orientation="vertical"
            (onChange)="onVolumeChange($event.value!)"
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
