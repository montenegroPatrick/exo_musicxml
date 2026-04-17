import { Component, input, signal, HostListener } from '@angular/core';
import { EpsComponent } from '@core/shared/eps/eps.component';
import { IJsonDiapoEps } from '../../interfaces/diapo.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eps-viewer',
  standalone: true,
  imports: [CommonModule, EpsComponent],
  template: `
    <div 
      class="w-full flex items-start justify-center px-4 py-2.5 overflow-hidden"
      [ngClass]="isMobile() ? 'h-auto' : 'h-full'"
    >
      @if (eps()) {
        <app-eps [eps]="eps()!"></app-eps>
      } @else {
        <div class="flex items-start justify-center h-full text-muted-foreground italic">
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
  
  readonly isMobile = signal<boolean>(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }
}
