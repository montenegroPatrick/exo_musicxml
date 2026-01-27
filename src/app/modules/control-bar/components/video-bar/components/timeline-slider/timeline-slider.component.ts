import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { ControlBarService } from '../../../../services/control-bar.service';

@Component({
  selector: 'app-timeline-slider',
  imports: [SliderModule, FormsModule],
  template: `
    <section class="flex-grow flex items-center gap-2">
      <span class="text-xs text-white/70 min-w-[40px]">{{ formatTime(currentTime()) }}</span>
      <p-slider
        [(ngModel)]="currentTime"
        (onChange)="onSeek($event.value!)"
        class="flex-grow px-2"
        [max]="duration()"
      />
      <span class="text-xs text-white/70 min-w-[40px]">{{ formatTime(duration()) }}</span>
    </section>
  `,
})
export class TimelineSliderComponent {
  private _controlBarService = inject(ControlBarService);

  duration = input<number>(0);
  currentTime = signal<number>(0);
  seek = output<number>();

  constructor() {
    effect(
      () => {
        this.currentTime.set(this._controlBarService.time());
      },
      { allowSignalWrites: true },
    );
  }

  onSeek(time: number) {
    this.seek.emit(time);
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
