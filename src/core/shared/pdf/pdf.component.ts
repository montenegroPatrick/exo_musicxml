import { Component, computed, inject, input, output } from '@angular/core';
import { IJsonDiapoPdf } from '@app/modules/diapo/interfaces/diapo.interface';
import { DiapoStateService } from '@app/modules/diapo/services/diapo.service';
import { PdfViewerModule, PDFDocumentProxy } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-pdf',
  imports: [PdfViewerModule],
  standalone: true,
  template: `@if (pdfUrl()) {
    <pdf-viewer
      [src]="pdfUrl()!"
      [render-text]="true"
      [original-size]="false"
      [autoresize]="true"
      [show-all]="false"
      [page]="currentPage()"
      (after-load-complete)="onPdfLoaded($event)"
    ></pdf-viewer>
  }`,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    pdf-viewer {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class PdfComponent {
  private _diapoService = inject(DiapoStateService);
  pdf = input.required<IJsonDiapoPdf>();
  pdfLoaded = output<number>();

  pdfUrl = computed(() => this._diapoService.currentPdfUrl());
  currentPage = computed(() => this._diapoService.currentImageListPos());

  onPdfLoaded(pdf: PDFDocumentProxy) {
    const totalPages = pdf.numPages;
    console.log('[PdfComponent]: PDF chargé, nombre de pages:', totalPages);
    this._diapoService.currentPdfTotalPages.set(totalPages);
  }
}
