import { Component, input } from '@angular/core';
import { CountInStatus } from '../../models/tap.model';

@Component({
  selector: 'app-countdown-display',
  standalone: true,
  template: `
    <div class="w-full p-4 text-center">
      <div class="flex flex-col gap-2 items-center justify-center">
        <p class="text-lg w-80">
          @switch(status()) {
            @case('play') {
              <span class="text-4xl text-red-500 font-bold">{{ tick() }}</span>
            }
            @case('finish') {
              C'est parti !
            }
            @case('not-started') {
              Appuyer sur le bouton pour "Commencer" quand vous êtes prêt.
            }
          }
        </p>
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class CountdownDisplayComponent {
  status = input.required<CountInStatus>();
  tick = input<number>(1);
}
