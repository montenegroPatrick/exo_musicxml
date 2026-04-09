import { Component, input } from '@angular/core';
import { PdfComponent } from '@core/shared/pdf/pdf.component';
import { IJsonDiapoPdf } from '../../interfaces/diapo.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, PdfComponent],
  template: `
    <div class="w-full h-full p-1 bg-neutral-100 rounded shadow-md overflow-hidden">
      @if (pdf()) {
        <app-pdf [pdf]="pdf()!"></app-pdf>
      } @else {
        <div class="flex items-center justify-center h-full text-muted-foreground animate-pulse">
          Chargement du document PDF...
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
export class PdfViewerComponent {
  pdf = input.required<IJsonDiapoPdf>();
}
