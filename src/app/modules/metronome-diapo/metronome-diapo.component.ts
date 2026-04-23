import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiapoComponent } from '@core/shared/diapo/diapo.component';

@Component({
  selector: 'app-metronome-diapo',
  standalone: true,
  imports: [CommonModule, DiapoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full bg-white">
      <app-diapo></app-diapo>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class MetronomeDiapoComponent {}
