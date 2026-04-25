import { Component, input, signal, HostListener } from '@angular/core';
import { EpsComponent } from '@core/shared/eps/eps.component';
import { IJsonDiapoEps } from '../../interfaces/diapo.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eps-viewer',
  standalone: true,
  imports: [CommonModule, EpsComponent],
  host: {
    '[class.view-mode-zoom]': "viewMode() === 'zoom'",
    '[class.view-mode-fit]': "viewMode() === 'fit'",
    'class': 'block w-full h-full'
  },
  template: `
    <div class="w-full h-full flex items-start justify-center overflow-hidden">
      @if (eps()) {
        <app-eps [eps]="eps()!"></app-eps>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    :host.view-mode-zoom {
      height: auto;
      min-height: 100%;
    }
  `]
})
export class EpsViewerComponent {
  eps = input.required<IJsonDiapoEps>();
  viewMode = input<'fit' | 'zoom'>('fit');
  readonly isMobile = signal<boolean>(window.innerWidth < 768);
}
