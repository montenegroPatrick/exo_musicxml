import { Component, input, signal, HostListener } from '@angular/core';
import { PdfComponent } from '@core/shared/pdf/pdf.component';
import { IJsonDiapoPdf } from '../../interfaces/diapo.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, PdfComponent],
  template: `
    <div 
      class="w-full flex items-center justify-center overflow-hidden"
      [ngClass]="isMobile() ? 'h-auto' : 'h-full'"
    >
      @if (pdf()) {
        <app-pdf [pdf]="pdf()!"></app-pdf>
      } @else {
        <div class="flex items-start justify-center h-full text-muted-foreground italic">
          Document PDF non trouvé.
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
    @media (max-width: 767px) {
      :host {
        height: auto;
      }
    }
  `]
})
export class PdfViewerComponent {
  pdf = input.required<IJsonDiapoPdf>();

  readonly isMobile = signal<boolean>(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }
}
