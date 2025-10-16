import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { IUserTap } from '../../models/tap.model';
import { TapRythmService } from '@app/flat/service/tap-rythm.service';
import { ExerciseStateService } from '@app/services/exercise-state.service';
import { TimerService } from '@app/services/timer.service';
import { MetronomeService } from '@app/services/metronome.service';

@Component({
  selector: 'app-tap-visualizer',
  standalone: true,
  template: `
    <div class="w-full max-w-[1024px] h-10   absolute bottom-0 left-0 right-0">
      <div
        class="w-full h-full  relative overflow-hidden shadow-lg border border-gray-200/50"
        style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);"
        #tapViewContainer
      >
        <!-- Subtle grid background -->
        <div
          class="absolute inset-0 opacity-20 z-0"
          style="background-image: repeating-linear-gradient(90deg, transparent, transparent 49px, #cbd5e1 49px, #cbd5e1 50px),
                                     repeating-linear-gradient(0deg, transparent, transparent 24px, #cbd5e1 24px, #cbd5e1 25px);"
        ></div>

        <!-- Progress gradient fill -->
        <!-- <div
          class="absolute top-0 bottom-0 z-10 transition-all duration-100"
          [style.width]="progressPosition()"
          style="background: linear-gradient(90deg, rgba(174, 199, 57, 0.15) 0%, rgba(174, 199, 57, 0.25) 100%);
                 box-shadow: inset 0 0 20px rgba(174, 199, 57, 0.1);"
        ></div> -->

        <!-- Center playhead line with glow -->
        <div
          class="absolute top-0 bottom-0 w-1 z-30 shadow-lg"
          [style.left]="progressPosition()"
          style="background: linear-gradient(180deg, #f8f9fa 0%, #f8f9fa 100%);
                 box-shadow: 0 0 15px rgba(174, 199, 57, 0.6), 0 0 30px rgba(174, 199, 57, 0.3);"
        >
          <!-- Playhead indicator circle -->
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style="background: #AEC739; box-shadow: 0 0 10px rgba(174, 199, 57, 0.8), 0 0 20px rgba(174, 199, 57, 0.4);"
          ></div>
        </div>

        <!-- Container that scrolls with feedback bars -->
        <div class="w-full md:max-w-[30%] absolute inset-0 z-20">
          @for (tap of taps(); track $index) {
          <div
            class="absolute top-2 bottom-2 w-1.5 z-20 rounded-full transition-all duration-200"
            [style.left]="getTapPosition(tap.timeMs)"
            [class]="getTapColor(tap.result)"
          ></div>
          }
        </div>
      </div>
    </div>
  `,
})
export class TapVisualizerComponent {
  private tapRythmService = inject(TapRythmService);
  private exerciseState = inject(ExerciseStateService);
  private timer = inject(TimerService);
  private metronome = inject(MetronomeService);

  totalDuration = computed(
    () => (this.tapRythmService.jsonXml().duration ?? 100000) + 1000
  );
  tapViewContainer = viewChild<ElementRef<HTMLDivElement>>('tapViewContainer');
  currentTime = computed(() => this.timer.currentTimeMs());
  taps = computed(() => this.exerciseState.userTaps());
  progressPosition = computed(() => {
    return this.getTapPosition(this.currentTime());
  });

  getTapPosition(tapTimeMs: number): string {
    const container = this.tapViewContainer();
    if (!container) return '0%';

    const containerWidth = container.nativeElement.offsetWidth;

    const pixelsPerMs = containerWidth / this.totalDuration();

    // Position absolue depuis le début de la timeline
    const position = tapTimeMs * pixelsPerMs;

    return `${position}px`;
  }

  getTapColor(result: string): string {
    switch (result) {
      case 'Good':
        return 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]';
      case 'Late':
        return 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]';
      case 'Early':
        return 'bg-yellow-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]';
      case 'Too early':
        return 'bg-red-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]';
      case 'Too late':
        return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]';
      default:
        return 'bg-gray-500 shadow-[0_0_10px_rgba(107,114,128,0.5)]';
    }
  }
}
