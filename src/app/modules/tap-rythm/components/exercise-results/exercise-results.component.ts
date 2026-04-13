import {
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Knob } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { L10N_LOCALE, L10nTranslatePipe } from 'angular-l10n';
import { ExerciseStateService } from '@app/modules/tap-rythm/services/exercise-state.service';

interface StatItem {
  label: string;
  value: number;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-exercise-results',
  standalone: true,
  imports: [CommonModule, Knob, FormsModule, ButtonModule, Dialog, L10nTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="false"
      [draggable]="false"
      [style]="{ width: '90vw', maxWidth: '600px', borderRadius: '32px' }"
      styleClass="premium-results-dialog"
    >
      <div class="flex flex-col items-center gap-8 py-4 px-2">
        
        <!-- Header Section -->
        <div class="text-center space-y-2">
          <h2 class="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic">
            @if (percentage() < 30) {
              {{ 'label.exo_xml.result_level.1' | translate: locale.language }}
            } @else if (percentage() < 50) {
              {{ 'label.exo_xml.result_level.2' | translate: locale.language }}
            } @else if (percentage() < 70) {
              {{ 'label.exo_xml.result_level.3' | translate: locale.language }}
            } @else if (percentage() < 90) {
              {{ 'label.exo_xml.result_level.4' | translate: locale.language }}
            } @else {
              {{ 'label.exo_xml.result_level.5' | translate: locale.language }}
            }
          </h2>
          <p class="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Session Performance</p>
        </div>

        <!-- Main Score Visualization -->
        @if (!showDetailedResults()) {
          <div class="relative group animate-in zoom-in duration-500">
            <p-knob
              [ngModel]="percentage()"
              [size]="220"
              [strokeWidth]="3"
              [readonly]="true"
              valueColor="#FA5E46"
              rangeColor="rgba(250,94,70,0.1)"
              textColor="#18181b"
              valueTemplate="{{ percentage() }}%"
            />
            <div class="absolute -inset-10 bg-[#FA5E46]/5 blur-3xl rounded-full -z-10 group-hover:bg-[#FA5E46]/10 transition-colors"></div>
          </div>
        } @else {
          <!-- Detailed Stats Grid -->
          <div class="w-full grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[350px] p-2">
            @for (stat of detailedStats(); track stat.label) {
              <div class="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl flex flex-col gap-1 transition-all hover:bg-white hover:shadow-lg hover:border-[#FA5E46]/20">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase text-zinc-400 tracking-wider">{{ stat.label | translate: locale.language }}</span>
                  <span [class]="stat.color" class="text-lg">{{ stat.icon }}</span>
                </div>
                <span class="text-2xl font-black text-zinc-900 leading-none">{{ stat.value }}</span>
              </div>
            }
          </div>
        }

        <!-- Actions Footer -->
        <div class="w-full space-y-3 mt-4">
          <div class="flex gap-3">
             <button (click)="restart.emit()" 
                    class="flex-1 h-14 rounded-2xl bg-zinc-100 text-zinc-900 font-bold hover:bg-zinc-200 transition-all uppercase tracking-tight">
              {{ 'label.exo_xml.restart' | translate: locale.language }}
            </button>
            <button (click)="continue.emit()" 
                    class="flex-1 h-14 rounded-2xl bg-[#FA5E46] text-white font-bold shadow-xl shadow-[#FA5E46]/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-tight">
              {{ 'label.exo_xml.continue' | translate: locale.language }}
            </button>
          </div>
          
          <button (click)="showDetailedResults.set(!showDetailedResults())" 
                  class="w-full py-2 text-zinc-400 font-bold text-[10px] uppercase tracking-widest hover:text-[#FA5E46] transition-colors">
            {{ showDetailedResults() ? 'Show Score' : 'Show Details' }}
          </button>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .premium-results-dialog {
      border: none;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
  `]
})
export class ExerciseResultsComponent implements OnInit {
  private readonly _exerciseState = inject(ExerciseStateService);
  readonly locale = inject(L10N_LOCALE);

  readonly restart = output<void>();
  readonly continue = output<void>();
  
  visible = signal<boolean>(false);
  showDetailedResults = signal<boolean>(false);

  readonly percentage = this._exerciseState.resultPercentage;
  readonly totalNotes = this._exerciseState.totalNotes;
  readonly totalTaps = this._exerciseState.totalTaps;
  readonly goodTaps = this._exerciseState.goodTaps;
  readonly lateTaps = this._exerciseState.lateTaps;
  readonly earlyTaps = this._exerciseState.earlyTaps;
  readonly tooLateTaps = this._exerciseState.tooLateTaps;
  readonly tooEarlyTaps = this._exerciseState.tooEarlyTaps;
  readonly missedTaps = this._exerciseState.missedTaps;

  readonly detailedStats = computed<StatItem[]>(() => [
    { label: 'label.exo_xml.total_notes', value: this.totalNotes(), color: 'text-zinc-400', icon: '📝' },
    { label: 'label.exo_xml.user_taps', value: this.totalTaps(), color: 'text-zinc-400', icon: '👆' },
    { label: 'label.exo_xml.good_taps', value: this.goodTaps(), color: 'text-emerald-500', icon: '✅' },
    { label: 'label.exo_xml.early', value: this.earlyTaps(), color: 'text-amber-500', icon: '↗️' },
    { label: 'label.exo_xml.late', value: this.lateTaps(), color: 'text-amber-500', icon: '↘️' },
    { label: 'label.exo_xml.too_early', value: this.tooEarlyTaps(), color: 'text-rose-500', icon: '❌' },
    { label: 'label.exo_xml.too_late', value: this.tooLateTaps(), color: 'text-rose-500', icon: '❌' },
    { label: 'label.exo_xml.missed', value: this.missedTaps(), color: 'text-zinc-500', icon: '💨' }
  ]);

  ngOnInit(): void {
    setTimeout(() => this.visible.set(true), 100);
  }
}
