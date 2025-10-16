import { Component, computed, input, output } from '@angular/core';
import { Knob } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-exercise-results',
  standalone: true,
  imports: [Knob, FormsModule, ButtonModule, Dialog],
  template: `
    <p-dialog [visible]="visible()" [modal]="true" [style]="{ width: '600px' }">
      <div class="w-full p-4 text-center flex flex-col items-center gap-4">
        <h2 class="text-2xl font-bold">
          @if (percentage() < 30) {
          <span>A refaire</span>
          } @else if (percentage() < 50) {
          <span>Passable</span>
          } @else if (percentage() < 70) {
          <span>Bien</span>
          } @else if (percentage() < 90) {
          <span>Très bien</span>
          } @else {
          <span>Excellent</span>
          }
        </h2>
        <div class="relative">
          <p-knob
            [ngModel]="percentage()"
            [size]="150"
            [strokeWidth]="2"
            [readonly]="true"
            [showValue]="true"
            valueTemplate="{{ percentage() }}%"
          />
        </div>

        <!-- Statistiques détaillées -->
        <div class="w-full bg-surface-50 rounded-lg p-4 space-y-3">
          <h3 class="text-lg font-semibold mb-3">Résultats détaillés</h3>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex justify-between p-2 bg-white rounded">
              <span class="font-medium">Notes totales:</span>
              <span class="font-bold">{{ totalNotes() }}</span>
            </div>

            <div class="flex justify-between p-2 bg-white rounded">
              <span class="font-medium">Vos taps:</span>
              <span class="font-bold">{{ totalTaps() }}</span>
            </div>

            <div class="flex justify-between p-2 bg-green-100 rounded">
              <span class="font-medium text-green-800">✓ Parfait:</span>
              <span class="font-bold text-green-800">{{ goodTaps() }}</span>
            </div>

            <div class="flex justify-between p-2 bg-orange-100 rounded">
              <span class="font-medium text-orange-700">↗ En avance:</span>
              <span class="font-bold text-orange-700">{{ earlyTaps() }}</span>
            </div>

            <div class="flex justify-between p-2 bg-blue-100 rounded">
              <span class="font-medium text-blue-700">↘ En retard:</span>
              <span class="font-bold text-blue-700">{{ lateTaps() }}</span>
            </div>

            <div class="flex justify-between p-2 bg-red-100 rounded">
              <span class="font-medium text-red-700">✗ Très en avance:</span>
              <span class="font-bold text-red-700">{{ tooEarlyTaps() }}</span>
            </div>

            <div class="flex justify-between p-2 bg-red-100 rounded">
              <span class="font-medium text-red-700">✗ Très en retard:</span>
              <span class="font-bold text-red-700">{{ tooLateTaps() }}</span>
            </div>

            <div class="flex justify-between p-2 bg-gray-100 rounded">
              <span class="font-medium text-gray-700">Manqués:</span>
              <span class="font-bold text-gray-700">{{
                missedTaps() - goodTaps()
              }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 items-stretch w-full">
          <p-button
            label="Recommencer"
            severity="danger"
            styleClass="w-full text-xl font-bold"
            (click)="restart.emit()"
          ></p-button>
          <p-button
            severity="primary"
            label="Continuer"
            styleClass="w-full text-xl font-bold"
            (click)="continue.emit()"
          ></p-button>
        </div>
      </div>
    </p-dialog>
  `,
})
export class ExerciseResultsComponent {
  percentage = input.required<number>();
  totalNotes = input.required<number>();
  totalTaps = input.required<number>();
  goodTaps = input.required<number>();
  lateTaps = input.required<number>();
  earlyTaps = input.required<number>();
  tooLateTaps = input.required<number>();
  tooEarlyTaps = input.required<number>();
  missedTaps = input.required<number>();
  restart = output<void>();
  continue = output<void>();
  visible = input<boolean>(false);
}
