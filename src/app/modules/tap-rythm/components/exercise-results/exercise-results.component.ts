import {
  Component,
  inject,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { L10N_LOCALE, L10nTranslatePipe } from 'angular-l10n';
import { DialogModule } from 'primeng/dialog';
import { ExerciseStateService } from '@app/modules/tap-rythm/services/exercise-state.service';

@Component({
  selector: 'app-exercise-results',
  standalone: true,
  imports: [CommonModule, L10nTranslatePipe, DialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog [visible]="true" [modal]="true" [closable]="false" [showHeader]="false"
              styleClass="bg-white rounded-[2rem] overflow-hidden shadow-2xl p-0 w-[95%] max-w-[500px] mx-auto border-0">
      
      <div class="flex flex-col items-center justify-start p-8 animate-in fade-in duration-300">
        <h2 class="text-3xl font-black text-zinc-800 mb-2">Résultats</h2>
        <p class="text-zinc-400 mb-8 text-lg">{{ score() > 80 ? 'Excellent travail !' : 'Continuez à vous entraîner !' }}</p>
        
        <!-- Score & Chart Section -->
        <div class="flex flex-col items-center justify-center gap-8 mb-10 w-full">
          <!-- Circular Progress -->
          <div class="relative w-40 h-40">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="74" stroke="currentColor" stroke-width="12" fill="transparent" class="text-zinc-100" />
              <circle cx="80" cy="80" r="74" stroke="currentColor" stroke-width="12" fill="transparent" 
                      [attr.stroke-dasharray]="464.95"
                      [attr.stroke-dashoffset]="464.95 - (464.95 * score() / 100)"
                      class="text-[#A3C139] transition-all duration-1000 ease-out" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-3xl font-black text-zinc-700">{{ score() }}%</span>
            </div>
          </div>

          <!-- Stats Breakdown -->
          <div class="flex flex-col gap-3 text-left w-full max-w-[280px]">
            <div class="flex items-center justify-between gap-8 border-b border-zinc-100 pb-2">
              <span class="text-sm font-bold text-zinc-400 uppercase tracking-wider">Parfait</span>
              <span class="text-lg font-black text-green-500">{{ goodTaps() }}</span>
            </div>
            <div class="flex items-center justify-between gap-8 border-b border-zinc-100 pb-2">
              <span class="text-sm font-bold text-zinc-400 uppercase tracking-wider">Bien</span>
              <span class="text-lg font-black text-yellow-500">{{ lateTaps() + earlyTaps() }}</span>
            </div>
            <div class="flex items-center justify-between gap-8 border-b border-zinc-100 pb-2">
              <span class="text-sm font-bold text-zinc-400 uppercase tracking-wider">Erreur / Oubli</span>
              <span class="text-lg font-black text-red-500">{{ missedTaps() + tooEarlyTaps() + tooLateTaps() }}</span>
            </div>
          </div>
        </div>

        <div class="w-full max-w-sm mx-auto space-y-3">
          <button (click)="continue.emit()" 
                  class="w-full h-14 rounded-full bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-all uppercase tracking-widest text-sm">
            {{ 'label.exo_xml.continue' | translate: locale.language }}
          </button>
          <button (click)="restart.emit()" 
                  class="w-full h-14 rounded-full bg-zinc-100 text-zinc-700 font-bold hover:bg-zinc-200 transition-all uppercase tracking-widest text-sm">
            {{ 'label.exo_xml.restart' | translate: locale.language }}
          </button>
          <button (click)="downloadLog.emit()" 
                  class="w-full h-10 rounded-full border border-zinc-200 text-zinc-400 text-xs font-bold hover:bg-zinc-50 transition-all uppercase tracking-widest mt-4">
            Télécharger le Log de vérification
          </button>
        </div>
      </div>
    </p-dialog>
  `
})
export class ExerciseResultsComponent {
  private readonly _exerciseState = inject(ExerciseStateService);
  readonly locale = inject(L10N_LOCALE);

  readonly restart = output<void>();
  readonly continue = output<void>();
  readonly downloadLog = output<void>();
  
  readonly score = this._exerciseState.resultPercentage;
  readonly goodTaps = this._exerciseState.goodTaps;
  readonly lateTaps = this._exerciseState.lateTaps;
  readonly earlyTaps = this._exerciseState.earlyTaps;
  readonly tooLateTaps = this._exerciseState.tooLateTaps;
  readonly tooEarlyTaps = this._exerciseState.tooEarlyTaps;
  readonly missedTaps = this._exerciseState.missedTaps;
}
