import {
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TapRythmService } from '@app/modules/tap-rythm/services/tap-rythm.service';
import { ExerciseStateService } from '@app/modules/tap-rythm/services/exercise-state.service';
import { TimerService } from '@app/modules/tap-rythm/services/timer.service';

@Component({
  selector: 'app-tap-visualizer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="w-full h-12 relative overflow-hidden rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl"
      #tapViewContainer
    >
      <!-- MEASURE MARKERS -->
      @for (time of measureTimes(); track $index) {
        <div class="absolute inset-y-0 w-px bg-white/10 z-0"
             [style.left]="getTapPosition(time)"></div>
      }

      <!-- PLAYHEAD -->
      <div
        class="absolute inset-y-0 w-1 bg-[#FA5E46] z-30 transition-shadow duration-150"
        [style.left]="progressPosition()"
        style="box-shadow: 0 0 20px rgba(250,94,70,0.8), 0 0 40px rgba(250,94,70,0.4);"
      >
        <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FA5E46] rounded-full blur-[2px]"></div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FA5E46] rounded-full blur-[2px]"></div>
      </div>

      <!-- TAP FEEDBACK -->
      <div class="absolute inset-0 z-20">
        @for (tap of taps(); track $index) {
          <div
            class="absolute inset-y-2 w-0.5 rounded-full transition-all duration-300"
            [style.left]="getTapPosition(tap.timeMs)"
            [ngClass]="getTapColor(tap.result)"
          ></div>
        }
      </div>

      <!-- PROGRESS OVERLAY -->
      <div class="absolute inset-y-0 left-0 bg-white/5 pointer-events-none z-10"
           [style.width]="progressPosition()"></div>
    </div>
  `,
})
export class TapVisualizerComponent {
  private readonly _tapRythmService = inject(TapRythmService);
  private readonly _exerciseState = inject(ExerciseStateService);
  private readonly _timer = inject(TimerService);

  private readonly _tapViewContainer = viewChild<ElementRef<HTMLDivElement>>('tapViewContainer');

  readonly totalDuration = computed(() => (this._tapRythmService.jsonXml().duration ?? 100000) + 1000);
  readonly currentTime = computed(() => this._timer.currentTimeMs());
  readonly taps = computed(() => this._exerciseState.userTaps());
  readonly nbMeasures = computed(() => this._exerciseState.nbMeasures());

  readonly measureTimes = computed(() => {
    const times: number[] = [];
    const count = this.nbMeasures();
    const duration = this.totalDuration();
    if (count <= 0) return [];
    
    for (let i = 0; i <= count; i++) {
      times.push((i * (duration - 1000)) / count);
    }
    return times;
  });

  readonly progressPosition = computed(() => this.getTapPosition(this.currentTime()));

  getTapPosition(tapTimeMs: number): string {
    const container = this._tapViewContainer();
    if (!container) return '0%';

    const containerWidth = container.nativeElement.offsetWidth;
    const position = (tapTimeMs / this.totalDuration()) * containerWidth;

    return `${position}px`;
  }

  getTapColor(result: string): string {
    switch (result) {
      case 'Good':
        return 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]';
      case 'Late':
      case 'Early':
        return 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]';
      case 'Too early':
      case 'Too late':
        return 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]';
      default:
        return 'bg-zinc-500';
    }
  }
}
