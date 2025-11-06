import {
  Component,
  computed,
  inject,
  Input,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { Knob } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { L10N_LOCALE, L10nTranslatePipe } from 'angular-l10n';
import { ExerciseStateService } from '@app/flat/services/exercise-state.service';

@Component({
  selector: 'app-exercise-results',
  standalone: true,
  imports: [Knob, FormsModule, ButtonModule, Dialog, L10nTranslatePipe],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [draggable]="false"
      [style]="{ width: '600px', height: '600px', zIndex: '1000' }"
    >
      <div
        class="w-full p-4 text-center h-full relative  flex flex-col items-center gap-4"
      >
        <div
          class="overflow-y-auto w-full flex items-center flex-grow  flex-col "
        >
          <h2 class="text-2xl font-bold">
            @if (percentage() < 30) {
            <span>{{
              'label.exo_xml.result_level.1' | translate : locale.language
            }}</span>
            } @else if (percentage() < 50) {
            <span>{{
              'label.exo_xml.result_level.2' | translate : locale.language
            }}</span>
            } @else if (percentage() < 70) {
            <span>{{
              'label.exo_xml.result_level.3' | translate : locale.language
            }}</span>
            } @else if (percentage() < 90) {
            <span>{{
              'label.exo_xml.result_level.4' | translate : locale.language
            }}</span>
            } @else {
            <span>{{
              'label.exo_xml.result_level.5' | translate : locale.language
            }}</span>
            }
          </h2>
          @if(!showDetailedResults()) {

          <p-knob
            [ngModel]="percentage()"
            [size]="150"
            [strokeWidth]="2"
            [readonly]="true"
            [showValue]="true"
            class="flex-0"
            valueTemplate="{{ percentage() }}%"
          />

          } @else {
          <!-- Statistiques détaillées -->
          <div class="w-full bg-surface-50 rounded-lg p-4 space-y-3">
            <h3 class="text-lg font-semibold mb-3">
              {{
                'label.exo_xml.detailed_results' | translate : locale.language
              }}
            </h3>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="flex justify-between p-2 bg-white rounded">
                <span class="font-medium"
                  >{{
                    'label.exo_xml.total_notes' | translate : locale.language
                  }}:</span
                >
                <span class="font-bold">{{ totalNotes() }}</span>
              </div>

              <div class="flex justify-between p-2 bg-white rounded">
                <span class="font-medium"
                  >{{
                    'label.exo_xml.user_taps' | translate : locale.language
                  }}:</span
                >
                <span class="font-bold">{{ totalTaps() }}</span>
              </div>

              <div class="flex justify-between p-2 bg-green-100 rounded">
                <span class="font-medium text-green-800"
                  >✓
                  {{
                    'label.exo_xml.good_taps' | translate : locale.language
                  }}:</span
                >
                <span class="font-bold text-green-800">{{ goodTaps() }}</span>
              </div>

              <div class="flex justify-between p-2 bg-orange-100 rounded">
                <span class="font-medium text-orange-700"
                  >↗
                  {{
                    'label.exo_xml.early' | translate : locale.language
                  }}:</span
                >
                <span class="font-bold text-orange-700">{{ earlyTaps() }}</span>
              </div>

              <div class="flex justify-between p-2 bg-blue-100 rounded">
                <span class="font-medium text-blue-700"
                  >↘
                  {{
                    'label.exo_xml.late' | translate : locale.language
                  }}:</span
                >
                <span class="font-bold text-blue-700">{{ lateTaps() }}</span>
              </div>

              <div class="flex justify-between p-2 bg-red-100 rounded">
                <span class="font-medium text-red-700"
                  >✗
                  {{
                    'label.exo_xml.too_early' | translate : locale.language
                  }}:</span
                >
                <span class="font-bold text-red-700">{{ tooEarlyTaps() }}</span>
              </div>

              <div class="flex justify-between p-2 bg-red-100 rounded">
                <span class="font-medium text-red-700"
                  >✗
                  {{
                    'label.exo_xml.too_late' | translate : locale.language
                  }}:</span
                >
                <span class="font-bold text-red-700">{{ tooLateTaps() }}</span>
              </div>

              <div class="flex justify-between p-2 bg-gray-100 rounded">
                <span class="font-medium text-gray-700"
                  >{{
                    'label.exo_xml.missed' | translate : locale.language
                  }}:</span
                >
                <span class="font-bold text-gray-700">{{ missedTaps() }}</span>
              </div>
            </div>
          </div>

          }
        </div>
        <div class=" flex flex-col gap-3 items-stretch w-full">
          <p-button
            link
            severity="secondary"
            [label]="showDetailedResults() ? 'Pourcentage' : 'Détails'"
            styleClass="w-full !bg-transparent underline"
            (click)="showDetailedResults.set(!showDetailedResults())"
          ></p-button>
          <p-button
            [label]="'label.exo_xml.restart' | translate : locale.language"
            severity="danger"
            styleClass="w-full text-xl font-bold"
            (click)="restart.emit()"
          ></p-button>
          <p-button
            severity="primary"
            [label]="'label.exo_xml.continue' | translate : locale.language"
            styleClass="w-full text-xl font-bold"
            (click)="continue.emit()"
          ></p-button>
        </div>
      </div>
    </p-dialog>
  `,
})
export class ExerciseResultsComponent implements OnInit {
  ngOnInit(): void {
    this.visible = true;
  }
  private exerciseState = inject(ExerciseStateService);
  showDetailedResults = signal<boolean>(false);
  locale = inject(L10N_LOCALE);
  percentage = computed(() => this.exerciseState.resultPercentage());
  totalNotes = computed(() => this.exerciseState.totalNotes());
  totalTaps = computed(() => this.exerciseState.totalTaps());
  goodTaps = computed(() => this.exerciseState.goodTaps());
  lateTaps = computed(() => this.exerciseState.lateTaps());
  earlyTaps = computed(() => this.exerciseState.earlyTaps());
  tooLateTaps = computed(() => this.exerciseState.tooLateTaps());
  tooEarlyTaps = computed(() => this.exerciseState.tooEarlyTaps());
  missedTaps = computed(() => this.exerciseState.missedTaps());
  restart = output<void>();
  continue = output<void>();
  visible = false;
  exerciceStatus = computed(
    () => this.exerciseState.exerciseStatus() === 'finish'
  );
  missed = computed(() => Math.abs(this.missedTaps() - this.goodTaps()));
}
