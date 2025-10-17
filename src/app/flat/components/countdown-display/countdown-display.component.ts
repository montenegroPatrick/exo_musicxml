import { Component, computed, inject, input } from '@angular/core';
import { CountInStatus } from '../../models/tap.model';

@Component({
  selector: 'app-countdown-display',
  standalone: true,

  template: `
    <div class="w-full p-4 h-full">
      <div
        class="flex w-full  h-full flex-col gap-2 items-center justify-center"
      >
        @switch(status()) { @case('play') {
        <p class="text-lg text-center">
          <span class="text-7xl text-secondary font-bold">{{ tick() }}</span>
        </p>
        } @case('finish') { } @case('not-started') {
        <!-- <p class=" text-center md:max-w-80">
          {{ homeSentence() }}
        </p> -->

        } }
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class CountdownDisplayComponent {
  status = input.required<CountInStatus>();
  tick = input<number>(1);
  isListening = input<boolean>(false);

  readonly homeSentence = computed(() =>
    this.isListening()
      ? 'En écoute.'
      : 'Appuyer sur le bouton pour "Commencer" quand vous êtes prêt.'
  );
}
