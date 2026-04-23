import { Component, computed, inject, input, output, signal, HostListener } from '@angular/core';
import { IJsonDiapoPdf } from '@core/shared/diapo/interfaces/diapo.interface';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';
import { PdfViewerModule, PDFDocumentProxy } from 'ng2-pdf-viewer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf',
  imports: [PdfViewerModule, CommonModule],
  standalone: true,
  template: `
    <div class="pdf-container" 
         [ngClass]="{
           'mobile-view': isMobile(), 
           'desktop-view': !isMobile(),
           'view-mode-fit': viewMode() === 'fit',
           'view-mode-zoom': viewMode() === 'zoom'
         }">
      @if (pdfUrl()) {
        <pdf-viewer
          [src]="pdfUrl()!"
          [render-text]="true"
          [original-size]="viewMode() === 'zoom'"
          [fit-to-page]="viewMode() === 'fit'"
          [zoom]="1"
          [autoresize]="true"
          [show-all]="false"
          [page]="currentPage()"
          (after-load-complete)="onPdfLoaded($event)"
          (error)="onError($event)"
          (on-progress)="onProgress($event)"
          class="pdf-viewer-element shadow-lg rounded bg-white"
          [style.aspect-ratio]="viewMode() === 'fit' ? (pdfRatio() || '1 / 1.414') : 'auto'"
        ></pdf-viewer>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .pdf-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: transparent;
    }
    .desktop-view {
      padding: 0;
      overflow: hidden;
    }
    .mobile-view {
      height: auto;
      overflow: visible;
      padding: 1rem 0;
    }
    .pdf-viewer-element {
      display: block;
      max-width: 100% !important;
      max-height: 100% !important;
      width: auto !important;
      height: auto !important;
      transition: all 0.3s ease-in-out;
    }
    .view-mode-fit .pdf-viewer-element {
      height: 100% !important;
      width: auto !important;
    }
    .view-mode-zoom .pdf-viewer-element {
      width: 100% !important;
      height: auto !important;
    }
  `,
})
export class PdfComponent {
  private _diapoService = inject(DiapoStateService);
  pdf = input.required<IJsonDiapoPdf>();
  pdfLoaded = output<number>();

  pdfUrl = computed(() => this._diapoService.currentPdfUrl());
  currentPage = computed(() => this._diapoService.currentImageListPos());
  viewMode = computed(() => this._diapoService.viewMode());
  pdfRatio = signal<string | null>(null);

  readonly isMobile = signal<boolean>(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  onPdfLoaded(pdf: PDFDocumentProxy) {
    const totalPages = pdf.numPages;
    this._diapoService.setPdfTotalPages(totalPages);

    // Calcul du ratio de la première page pour adapter la largeur à la hauteur fixe
    pdf.getPage(1).then(page => {
      const viewport = page.getViewport({ scale: 1 });
      const ratio = viewport.width / viewport.height;
      this.pdfRatio.set(`${ratio}`);
      console.log('[PdfComponent]: Ratio calculé:', ratio);
    });
  }

  onError(error: any) {
    console.error('[PdfComponent]: Erreur lors du chargement du PDF:', error);
  }

  onProgress(progressData: any) {
    console.log('[PdfComponent]: Chargement en cours...', progressData.loaded, '/', progressData.total);
  }
}
