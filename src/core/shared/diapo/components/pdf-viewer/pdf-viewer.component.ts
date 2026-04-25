import { Component, input, signal, HostListener } from '@angular/core';
import { PdfComponent } from '@core/shared/pdf/pdf.component';
import { IJsonDiapoPdf } from '../../interfaces/diapo.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, PdfComponent],
  host: {
    '[class.view-mode-zoom]': "viewMode() === 'zoom'",
    '[class.view-mode-fit]': "viewMode() === 'fit'",
    '[class.h-full]': "viewMode() === 'fit'",
    '[class.h-auto]': "viewMode() === 'zoom'",
    'class': 'block w-full'
  },
  template: `
    <div class="w-full flex justify-center"
         [ngClass]="{
           'h-full items-center overflow-hidden': viewMode() === 'fit',
           'h-auto items-start overflow-visible': viewMode() === 'zoom'
         }">
      @if (pdf()) {
        <app-pdf [pdf]="pdf()!"></app-pdf>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    :host.view-mode-fit {
      height: 100%;
    }
    :host.view-mode-zoom {
      height: auto;
      min-height: 100%;
    }
  `]
})
export class PdfViewerComponent {
  pdf = input.required<IJsonDiapoPdf>();
  viewMode = input<'fit' | 'zoom'>('fit');
  readonly isMobile = signal<boolean>(window.innerWidth < 768);
}
