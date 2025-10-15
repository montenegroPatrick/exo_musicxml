import { Component, inject, input } from '@angular/core';
import { CountInStatus } from '../../models/tap.model';

@Component({
  selector: 'app-countdown-display',
  standalone: true,

  template: `
    <div class="w-full p-4 ">
      <div class="flex flex-col gap-2 items-center justify-center">
        @switch(status()) { @case('play') {
        <p class="text-lg text-center">
          <span class="text-4xl text-red-500 font-bold">{{ tick() }}</span>
        </p>
        } @case('finish') { } @case('not-started') {
        <p class=" text-center md:max-w-9/12">
          Appuyer sur le bouton pour "Commencer" quand vous êtes prêt.
        </p>

        } }
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class CountdownDisplayComponent {
  status = input.required<CountInStatus>();
  tick = input<number>(1);
}
