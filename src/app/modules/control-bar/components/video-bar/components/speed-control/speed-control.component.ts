import { Component, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-speed-control',
  imports: [ButtonModule, MenuModule],
  template: `
    <div class="relative">
      <p-button
        [label]="currentSpeed() + 'x'"
        [text]="true"
        severity="secondary"
        size="small"
        (onClick)="menu.toggle($event)"
      />
      <p-menu #menu [model]="speedOptions" [popup]="true" appendTo="body" />
    </div>
  `,
})
export class SpeedControlComponent {
  currentSpeed = signal<number>(1);
  speedChange = output<number>();

  speedOptions: MenuItem[] = [
    { label: '0.25x', command: () => this.setSpeed(0.25) },
    { label: '0.5x', command: () => this.setSpeed(0.5) },
    { label: '0.75x', command: () => this.setSpeed(0.75) },
    { label: '1x (Normal)', command: () => this.setSpeed(1) },
    { label: '1.25x', command: () => this.setSpeed(1.25) },
    { label: '1.5x', command: () => this.setSpeed(1.5) },
    { label: '1.75x', command: () => this.setSpeed(1.75) },
    { label: '2x', command: () => this.setSpeed(2) },
  ];

  setSpeed(speed: number) {
    this.currentSpeed.set(speed);
    this.speedChange.emit(speed);
  }
}
