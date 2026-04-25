import { Component, computed, inject, input, output, signal, HostListener } from '@angular/core';
import { IJsonDiapoPdf } from '@core/shared/diapo/interfaces/diapo.interface';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';
import { PdfViewerModule, PDFDocumentProxy } from 'ng2-pdf-viewer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf',
  imports: [PdfViewerModule, CommonModule],
  standalone: true,
  host: {
    '[class.view-mode-zoom]': "viewMode() === 'zoom'",
    '[class.view-mode-fit]': "viewMode() === 'fit'"
  },
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss'],
})
export class PdfComponent {
  private _diapoService = inject(DiapoStateService);
  
  pdf = input.required<IJsonDiapoPdf>();
  pdfLoaded = output<number>();

  private _refreshTrigger = signal<number>(0);

  pdfUrl = computed(() => {
    this.viewMode(); 
    this._refreshTrigger();
    return this._diapoService.currentPdfUrl();
  });
  viewMode = computed(() => this._diapoService.viewMode());
  currentPos = computed(() => this._diapoService.currentImageListPos());
  
  readonly isMobile = signal<boolean>(window.innerWidth < 768);

  zoomLevel = computed(() => {
    if (this.viewMode() === 'zoom') {
      return 1.2;
    }
    return 1;
  });

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  onPdfLoaded(pdf: PDFDocumentProxy) {
    const totalPages = pdf.numPages;
    this._diapoService.setPdfTotalPages(totalPages);
    this.pdfLoaded.emit(totalPages);
  }

  onError(error: any) {
    console.error('[PdfComponent]: Error loading PDF:', error);
  }
}
