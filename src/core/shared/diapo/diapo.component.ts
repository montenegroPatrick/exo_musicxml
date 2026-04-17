import { Component, computed, inject, input, OnInit, ChangeDetectionStrategy, effect, untracked, signal, HostListener } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './diapo.component.html',
})
export class DiapoComponent implements OnInit {
  private readonly _diapoService = inject(DiapoStateService);
  private readonly _lessonService = inject(LessonService);

  // -- Inputs --
  theme = input<'light' | 'dark'>('light');
  showControls = input<boolean>(true);
  allowZoom = input<boolean>(true);

  // -- Reactive Mappings --
  readonly type = this._diapoService.type;
  readonly viewMode = this._diapoService.viewMode;
  readonly layoutMode = this._diapoService.layoutMode;
  readonly imageListPos = this._diapoService.currentImageListPos;
  
  readonly xml = this._diapoService.currentXmlUrl;
  readonly jsonEps = this._diapoService.jsonDiapoEps;
  readonly jsonPdf = this._diapoService.jsonDiapoPdf;
  readonly currentImgEps = this._diapoService.currentImgEps;
  readonly currentPdfUrl = this._diapoService.currentPdfUrl;
  
  readonly pdfTotalPages = this._diapoService.currentPdfTotalPages;

  readonly isMobile = signal<boolean>(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  constructor() {
    effect(() => {
      const lesson = this._lessonService.lessonJson();
      const diapoType = this._lessonService.diapoType();

      if (lesson && diapoType) {
        untracked(() => {
          this._diapoService.setType(diapoType as any);
          this._diapoService.initVariables(lesson);
        });
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {}

  printable = computed(() => {
    switch (this.type()) {
      case 'xml': return false;
      case 'eps': return this.jsonEps()?.printable;
      case 'pdf': return this.jsonPdf()?.printable;
      case 'html': return this._diapoService.jsonDiapoHtml()?.printable;
      default: return false;
    }
  });

  imageList = computed(() => {
    switch (this.type()) {
      case 'eps': return this._diapoService.currentImageListEps();
      case 'pdf': return this._diapoService.currentImageListPdf();
      default: return null;
    }
  });

  canNavigate = computed(() => {
    const len = this.imageList()?.length ?? 0;
    return len > 1 || this.type() === 'pdf';
  });

  nextPage(): void {
    const max = this.pdfTotalPages() || (this.imageList()?.length ?? 0);
    if (this.imageListPos() < max) {
      this._diapoService.setPos(this.imageListPos() + 1);
    }
  }

  previousPage(): void {
    if (this.imageListPos() > 1) {
      this._diapoService.setPos(this.imageListPos() - 1);
    }
  }

  printPdf(): void {
    if (this.type() === 'xml') return;
    
    const url = this.type() === 'pdf'
      ? this.currentPdfUrl()
      : this.currentImgEps()?.url;
      
    if (url) {
      window.open(url)?.print();
    }
  }
}
