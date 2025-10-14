import { Component, computed, input, output } from '@angular/core';
import { Knob } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-exercise-results',
  standalone: true,
  imports: [Knob, FormsModule, ButtonModule],
  template: `
    <div class="w-full p-4 text-center flex flex-col items-center gap-4">
      <h2 class="text-lg font-bold">
        @if (percentage() < 30) {
        <span>Mauvais</span>
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
      <div class="flex flex-col gap-4 items-stretch w-fit">
        <p-button
          label="Recommencer"
          severity="danger"
          styleClass="w-full p-secondary text-3xl font-bold "
          (click)="restart.emit()"
        ></p-button>
        <p-button
          severity="primary"
          label="Continuer"
          styleClass="w-full p-primary text-3xl font-bold"
          (click)="continue.emit()"
        ></p-button>
      </div>
    </div>
  `,
})
export class ExerciseResultsComponent {
  percentage = input.required<number>();
  restart = output<void>();
  continue = output<void>();
}
