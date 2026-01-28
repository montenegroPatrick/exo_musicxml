import { Component, computed, inject, OnInit } from '@angular/core';
import { EpsComponent } from '@core/shared/eps/eps.component';
import { PdfComponent } from '@core/shared/pdf/pdf.component';
import { XmlComponent } from '@core/shared/xml/xml.component';
import { ImgStateService } from './services/img.service';
import { ButtonModule } from 'primeng/button';
import { LessonService } from '../lesson/services/lesson.service';

@Component({
  selector: 'app-img',
  imports: [XmlComponent, EpsComponent, PdfComponent, ButtonModule],
  templateUrl: './img.component.html',
})
export class ImgComponent implements OnInit {
  private _imgService = inject(ImgStateService);
  private _lessonService = inject(LessonService);

  ngOnInit(): void {
    // Initialize ImgStateService with lesson data if not already initialized
    // (VideoImgComponent may have already initialized it)
    const lesson = this._lessonService.lessonJson();
    const imgType = this._lessonService.imgType();

    if (lesson && imgType && !this._imgService.type()) {
      this._imgService.type.set(imgType);
      this._imgService.initVariables(lesson);
    }
  }
  type = computed(() => this._imgService.type());
  printable = computed(() => {
    switch (this.type()) {
      case 'xml':
        return false;
      case 'eps':
        return this.jsonEps()?.printable;
      case 'pdf':
        return this.jsonPdf()?.printable;
      default:
        return false;
    }
  });
  imageList = computed(() => {
    switch (this.type()) {
      case 'eps':
        return this._imgService.currentImageListEps();
      case 'pdf':
        return this._imgService.currentImageListPdf();
      default:
        return null;
    }
  });
  canNavigate = computed(
    () => (this.imageList()?.length ?? 0 > 1) || this.type() == 'pdf',
  );
  xml = computed(() => this._imgService.currentXmlUrl());
  imageListPos = computed(() => this._imgService.currentImageListPos());
  currentImgEps = computed(() => this._imgService.currentImgEps());
  jsonEps = computed(() => this._imgService.jsonImgEps());
  jsonPdf = computed(() => this._imgService.jsonImgPdf());
  pdfTotalPages = computed(() => this._imgService.currentPdfTotalPages());

  nextPage() {
    this._imgService.currentImageListPos.set(
      this._imgService.currentImageListPos() + 1,
    );
  }
  previousPage() {
    this._imgService.currentImageListPos.set(
      this._imgService.currentImageListPos() - 1,
    );
  }
  printPdf() {
    if (this.type() === 'xml') {
      return;
    }
    const url =
      this.type() === 'pdf'
        ? this._imgService.currentPdfUrl()!
        : this.currentImgEps()?.url;
    window.open(url)?.print();
  }
}
