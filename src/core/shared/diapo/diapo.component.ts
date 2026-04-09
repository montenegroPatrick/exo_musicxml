import { Component, computed, inject, input, OnInit } from '@angular/core';
import { DiapoStateService } from './services/diapo.service';
import { ButtonModule } from 'primeng/button';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { XmlViewerComponent } from './components/xml-viewer/xml-viewer.component';
import { EpsViewerComponent } from './components/eps-viewer/eps-viewer.component';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
import { HtmlViewerComponent } from './components/html-viewer/html-viewer.component';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-diapo',
  standalone: true,
  imports: [
    CommonModule,
    XmlViewerComponent,
    EpsViewerComponent,
    PdfViewerComponent,
    HtmlViewerComponent,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './diapo.component.html',
})
export class DiapoComponent implements OnInit {
  private _diapoService = inject(DiapoStateService);
  private _lessonService = inject(LessonService);

  /** Theme: 'light' (default) or 'dark' */
  theme = input<'light' | 'dark'>('light');

  /** Show/Hide the navigation and toolkit sidebar */
  showControls = input<boolean>(true);

  /** Allow/Disallow zoom feature */
  allowZoom = input<boolean>(true);

  ngOnInit(): void {
    const lesson = this._lessonService.lessonJson();
    const diapoType = this._lessonService.diapoType();

    // Auto-initialize if data is available and not already set
    if (lesson && diapoType) {
      if (this._diapoService.type() !== diapoType) {
        this._diapoService.type.set(diapoType as any);
      }
      this._diapoService.initVariables(lesson);
    }
  }

  type = computed(() => this._diapoService.type());

  printable = computed(() => {
    switch (this.type()) {
      case 'xml':
        return false;
      case 'eps':
        return this.jsonEps()?.printable;
      case 'pdf':
        return this.jsonPdf()?.printable;
      case 'html':
        return this._diapoService.jsonDiapoHtml()?.printable;
      default:
        return false;
    }
  });

  imageList = computed(() => {
    switch (this.type()) {
      case 'eps':
        return this._diapoService.currentImageListEps();
      case 'pdf':
        return this._diapoService.currentImageListPdf();
      default:
        return null;
    }
  });

  canNavigate = computed(
    () => ((this.imageList()?.length ?? 0) > 1) || this.type() === 'pdf',
  );

  xml = computed(() => this._diapoService.currentXmlUrl());
  imageListPos = computed(() => this._diapoService.currentImageListPos());
  currentImgEps = computed(() => this._diapoService.currentImgEps());
  jsonEps = computed(() => this._diapoService.jsonDiapoEps());
  jsonPdf = computed(() => this._diapoService.jsonDiapoPdf());
  pdfTotalPages = computed(() => this._diapoService.currentPdfTotalPages());
  viewMode = computed(() => this._diapoService.viewMode());
  layoutMode = computed(() => this._diapoService.layoutMode());

  nextPage() {
    const max = this.pdfTotalPages() || (this.imageList()?.length ?? 0);
    if (this.imageListPos() < max) {
      this._diapoService.currentImageListPos.set(this.imageListPos() + 1);
    }
  }

  previousPage() {
    if (this.imageListPos() > 1) {
      this._diapoService.currentImageListPos.set(this.imageListPos() - 1);
    }
  }

  toggleViewMode() {
    this._diapoService.viewMode.set(
      this.viewMode() === 'fit' ? 'zoom' : 'fit'
    );
  }

  toggleLayoutMode() {
    this._diapoService.layoutMode.set(
      this.layoutMode() === 'standard' ? 'expanded' : 'standard'
    );
  }

  printPdf() {
    if (this.type() === 'xml') {
      return;
    }
    const url =
      this.type() === 'pdf'
        ? this._diapoService.currentPdfUrl()!
        : this.currentImgEps()?.url;
    if (url) {
      window.open(url)?.print();
    }
  }
}
