import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import {
  IImg,
  ImageItem,
  IJsonImgEps,
  ImgType,
  IJSONImgXML,
  IJsonImgPdf,
} from '../interfaces/img.interface';
import { api_url } from '@core/constant/api_url';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class ImgStateService {
  private readonly _imgUrl = `${api_url.lesson}`;
  private _imgApiService = inject(ImgApiService);
  private _sanitizer = inject(DomSanitizer);
  //GLOBAL VARIABLE
  type = signal<ImgType | null>(null);
  //global position of imagelist
  currentImageListPos = signal<number>(1);

  // EPS VARIABLE
  jsonImgEps = signal<IImg | null>(null);
  currentImgEps = signal<ImageItem | null>(null);

  currentImageListEps = signal<ImageItem[] | null>(null);
  // PDF VARIABLE
  jsonImgPdf = signal<IImg | null>(null);
  currentImgPdf = signal<ImageItem | null>(null);
  currentImageListPdf = signal<ImageItem[] | null>(null);
  currentPdfBlob = signal<Blob | null>(null);
  currentPdfUrl = signal<string | null>(null);
  currentPdfTotalPages = signal<number>(0);

  //IMAGE XML VARIABLE
  currentJsonXml = signal<IJSONImgXML | null>(null);
  currentXmlUrl = signal<string | null>(null);

  imageIsReady = signal<boolean>(false);

  getJsonImg({ lessonId, seq }: { lessonId: string; seq: string }) {
    const url = `${this._imgUrl}/${lessonId}/seq/${seq}.json`;
    return this._imgApiService.getJsonImg(url).pipe(
      map((res: IJSONImgXML | IJsonImgEps | IJsonImgPdf) => {
        switch (this.type()) {
          case 'xml':
            this._handleJsonXml(res as IJSONImgXML);
            break;
          case 'eps':
            this._handleJsonEps(res as IJsonImgEps);
            break;
          case 'pdf':
            this._handleJsonPdf(res as IJsonImgPdf);
            break;
        }
        return res;
      }),
    );
  }
  initVariables(data: IJSONImgXML | IJsonImgEps | IJsonImgPdf) {
    switch (this.type()) {
      case 'xml':
        this._handleJsonXml(data as IJSONImgXML);
        break;
      case 'eps':
        this._handleJsonEps(data as IJsonImgEps);
        break;
      case 'pdf':
        this._handleJsonPdf(data as IJsonImgPdf);
        break;
    }
  }
  _handleJsonXml(xml: IJSONImgXML) {
    this.currentJsonXml.set(xml);

    this.xmlFetch(xml.url ?? '')
      .pipe(
        map((xml: string) => {
          this.currentXmlUrl.set(xml);
          return xml;
        }),
      )
      .subscribe({
        next: () => {},
      });
  }
  _handleJsonEps(eps: IJsonImgEps) {
    this.jsonImgEps.set(eps);
    if (eps.imageList != undefined && eps.imageList?.length > 0) {
      this.currentImageListEps.set(eps.imageList);
      this.currentImgEps.set(eps.imageList[0]);
    }
  }
  _handleJsonPdf(pdf: IJsonImgPdf) {
    this.jsonImgPdf.set(pdf);
    if (pdf.pos) {
      this.currentImageListPos.set(pdf.pos);
    }
    if (pdf.url) {
      this.loadPdfBlob(pdf.url).subscribe({
        error(e) {
          console.log('error on loadPdf blob ', e);
        },
      });
    }
  }

  loadPdfBlob(url: string) {
    return this._imgApiService.getPdfBlob(url).pipe(
      map((blob: Blob) => {
        this.currentPdfBlob.set(blob);
        const blobUrl = URL.createObjectURL(blob);
        // #toolbar=0 masque la toolbar du viewer PDF
        this.currentPdfUrl.set(`${blobUrl}#toolbar=0`);
        return blob;
      }),
    );
  }
  xmlFetch(xmlUrl: string) {
    return this._imgApiService.getXml(xmlUrl).pipe(
      map((xml: string) => {
        this.currentXmlUrl.set(xmlUrl);
        return xml;
      }),
    );
  }
}
@Injectable({
  providedIn: 'root',
})
export class ImgApiService {
  private _http = inject(HttpClient);

  getJsonImg(url: string): Observable<IJSONImgXML | IJsonImgEps | IJsonImgPdf> {
    return this._http.get<IJSONImgXML | IJsonImgEps | IJsonImgPdf>(url);
  }

  getPdfBlob(url: string): Observable<Blob> {
    return this._http.get(url, { responseType: 'blob' });
  }
  getXml(url: string): Observable<string> {
    return this._http.get(url, { responseType: 'text' });
  }
}
