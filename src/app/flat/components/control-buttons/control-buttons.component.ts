import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-control-buttons',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <p-button
      [disabled]="!xmlLoaded()"
      [severity]="isPlaying() ? 'danger' : 'secondary'"
      [label]="isPlaying() ? 'Arrêter' : 'Commencer'"
      styleClass="text-lg "
      (click)="playStop.emit()"
    ></p-button>
  `,
})
export class ControlButtonsComponent {
  isPlaying = input<boolean>(false);
  xmlLoaded = input<boolean>(false);
  playStop = output<void>();
}
