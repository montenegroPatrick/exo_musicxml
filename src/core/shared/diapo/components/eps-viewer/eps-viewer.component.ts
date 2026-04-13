import { Component, input } from '@angular/core';
import { EpsComponent } from '@core/shared/eps/eps.component';
import { IJsonDiapoEps } from '../../interfaces/diapo.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eps-viewer',
  standalone: true,
  imports: [CommonModule, EpsComponent],
  template: `
    <div class="w-full h-full flex items-center justify-center">
      @if (eps()) {
        <app-eps [eps]="eps()!"></app-eps>
      } @else {
        <div class="flex items-center justify-center h-full text-muted-foreground italic">
          Aucune image à afficher.
        </div>
      }
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
export class EpsViewerComponent {
  eps = input.required<IJsonDiapoEps>();
}
