import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountInStatus } from '../../interface/flat.interface';

@Component({
  selector: 'app-countdown-display',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      @if (status() === 'play') {
        <div class="relative">
          <!-- Animated Tick Number (Remounts on every tick for animation restart) -->
          @for (t of [tick()]; track t) {
            <div class="text-[180px] font-black text-[#FA5E46] drop-shadow-[0_0_30px_rgba(250,94,70,0.4)] animate-countdown-pulse">
              {{ t }}
            </div>
          }
          
          <!-- Outer Ring Decoration -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-[#FA5E46]/20 rounded-full animate-ping"></div>
        </div>
      }
      
      <div class="absolute bottom-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <p class="text-zinc-400 font-medium tracking-[0.2em] uppercase text-sm">
          {{ instructionText() }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes countdown-pulse {
      0% { transform: scale(0.5); opacity: 0; }
      20% { transform: scale(1.1); opacity: 1; }
      80% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.2); opacity: 0; }
    }
    .animate-countdown-pulse {
      animation: countdown-pulse 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
  `]
})
export class CountdownDisplayComponent {
  readonly status = input.required<CountInStatus>();
  readonly tick = input<number>(1);
  readonly isListening = input<boolean>(false);

  readonly instructionText = computed(() =>
    this.isListening()
      ? 'Listening mode active'
      : 'Get ready to tap...'
  );
}
