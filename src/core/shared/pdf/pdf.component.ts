import { Component, computed, inject, input, output } from '@angular/core';
import { IJsonImgPdf } from '@app/modules/img/interfaces/img.interface';
import { ImgStateService } from '@app/modules/img/services/img.service';
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
  private imgService = inject(ImgStateService);
  pdf = input.required<IJsonImgPdf>();
  pdfLoaded = output<number>();

  pdfUrl = computed(() => this.imgService.currentPdfUrl());
  currentPage = computed(() => this.imgService.currentImageListPos());

  onPdfLoaded(pdf: PDFDocumentProxy) {
    const totalPages = pdf.numPages;
    console.log('PDF chargé, nombre de pages:', totalPages);
    this.imgService.currentPdfTotalPages.set(totalPages);
  }
}
