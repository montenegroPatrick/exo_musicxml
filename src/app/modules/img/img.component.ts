import { Component, computed, inject } from '@angular/core';
import { EpsComponent } from '@core/shared/eps/eps.component';
import { PdfComponent } from '@core/shared/pdf/pdf.component';
import { XmlComponent } from '@core/shared/xml/xml.component';
import { ImgStateService } from './services/img.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-img',
  imports: [XmlComponent, EpsComponent, PdfComponent, ButtonModule],
  templateUrl: './img.component.html',
})
export class ImgComponent {
  private _imgService = inject(ImgStateService);
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
  jsonXml = computed(() => this._imgService.currentJsonXml());
  imageListPos = computed(() => this._imgService.currentImageListPos());
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
}
