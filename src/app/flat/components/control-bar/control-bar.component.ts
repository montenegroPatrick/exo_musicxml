import { Component, computed, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ExerciseStateService } from '@app/services/exercise-state.service';

@Component({
  selector: 'app-control-bar',
  imports: [CommonModule],

  styles: ``,
  template: `
    <div class="bg-primary flex justify-between h-15 items-center w-full">
      <div class="flex gap-4">
        <ng-content select="left-content"></ng-content>
      </div>
      <div class="flex gap-4 z-20 flex-grow">
        <ng-content select="center-content"></ng-content>
      </div>
      <div class="flex gap-4">
        <ng-content select="right-content"></ng-content>
      </div>
    </div>
  `,
})
export class ControlBarComponent {
  private exerciseState = inject(ExerciseStateService);

  isPlaying = computed(() => this.exerciseState.isPlaying());
}
