import { Component, model, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'app-volume-control',
  standalone: true,
  imports: [ButtonModule, SliderModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <p-button
        [icon]="volumeIcon()"
        [text]="true"
        severity="secondary"
        styleClass="text-zinc-400 hover:text-white transition-colors"
        (onClick)="handleToggleVolumeSliderView()"
      />
      @if (!hidden()) {
        <div class="absolute bottom-16 left-4 bg-[#2a2a2a] p-3 rounded-lg shadow-2xl border border-white/10 z-50">
          <p-slider
            [(ngModel)]="volumeValue"
            [max]="100"
            [min]="0"
            orientation="vertical"
            (onChange)="onVolumeChange($event.value!)"
            class="h-32 block"
          />
        </div>
      }
    </div>
  `,
})
export class VolumeControlComponent {
  /** Two-way bindable volume */
  volume = model<number>(100);
  isMuted = signal<boolean>(false);
  
  /** Technical property for ngModel binding to signals */
  get volumeValue(): number { return this.volume(); }
  set volumeValue(val: number) { this.volume.set(val); }

  private previousVolume = 100;

  volumeChange = output<number>();
  muteChange = output<boolean>();

  hidden = signal<boolean>(true);

  /** Computed icon based on volume level */
  volumeIcon = computed(() => {
    const vol = this.volume();
    if (this.isMuted() || vol === 0) return 'pi pi-volume-off';
    if (vol < 50) return 'pi pi-volume-down';
    return 'pi pi-volume-up';
  });

  handleToggleVolumeSliderView() {
    this.hidden.update(v => !v);
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
