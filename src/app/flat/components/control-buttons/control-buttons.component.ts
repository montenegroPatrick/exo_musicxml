import { Component, input, output } from '@angular/core';
import { Button, ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-control-buttons',
  standalone: true,
  imports: [Button, ButtonModule],
  template: `
    <div class="flex gap-2 items-center">
      @if(!isPlaying()) {
      <p-button
        [disabled]="!xmlLoaded()"
        [severity]="isListening() ? 'danger' : 'primary'"
        [label]="isListening() ? 'Stop' : 'Ecouter'"
        styleClass="text-lg "
        (click)="toggleListen.emit()"
      ></p-button>
      } @if(!isListening()) {
      <p-button
        [disabled]="!xmlLoaded()"
        [severity]="isPlaying() ? 'danger' : 'secondary'"
        [label]="isPlaying() ? 'Arrêter' : 'Commencer'"
        styleClass="text-lg "
        (click)="playStop.emit()"
      ></p-button>
      }
    </div>
  `,
})
export class ControlButtonsComponent {
  isPlaying = input<boolean>(false);
  isListening = input<boolean>(false);
  xmlLoaded = input<boolean>(false);
  playStop = output<void>();
  toggleListen = output<void>();
}
