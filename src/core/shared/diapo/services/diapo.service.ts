import { computed, inject, Injectable, signal } from '@angular/core';
import {
  IDiapo,
  ImageItem,
  IJsonDiapoEps,
  DiapoType,
  IJSONDiapoXML,
  IJsonDiapoPdf,
  IJsonDiapoHtml,
} from '../interfaces/diapo.interface';
import { ILesson } from '@core/interfaces/lesson.interface';
import { api_url } from '@core/constant/api_url';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class DiapoStateService {
  private readonly _imgUrl = `${api_url.lesson}`;
  private _imgApiService = inject(DiapoApiService);
  private _sanitizer = inject(DomSanitizer);
  
  // GLOBAL VARIABLE
  type = signal<DiapoType | null>(null);
  // global position of imagelist
  currentImageListPos = signal<number>(1);
  
  // view mode: 'fit' (entire image visible) or 'zoom' (full width scrollable)
  viewMode = signal<'fit' | 'zoom'>('fit');

  // layout mode: 'standard' (1/3 diapo) or 'expanded' (2/3 diapo)
  layoutMode = signal<'standard' | 'expanded'>('standard');

  // EPS VARIABLE
  jsonDiapoEps = signal<IDiapo | null>(null);
  currentImageListEps = signal<ImageItem[] | null>(null);
  currentImgEps = computed(() => {
    const list = this.currentImageListEps();
    const pos = this.currentImageListPos();
    if (list && list.length >= pos && pos > 0) {
      return list[pos - 1];
    }
    return list && list.length > 0 ? list[0] : null;
  });

  // PDF VARIABLE
  jsonDiapoPdf = signal<IDiapo | null>(null);
  currentImageListPdf = signal<ImageItem[] | null>(null);
  currentImgPdf = computed(() => {
    const list = this.currentImageListPdf();
    const pos = this.currentImageListPos();
    if (list && list.length >= pos && pos > 0) {
      return list[pos - 1];
    }
    return list && list.length > 0 ? list[0] : null;
  });
  currentPdfBlob = signal<Blob | null>(null);
  currentPdfUrl = signal<string | null>(null);
  currentPdfTotalPages = signal<number>(0);

  // IMAGE XML VARIABLE
  currentJsonXml = signal<IJSONDiapoXML | null>(null);
  currentXmlUrl = signal<string | null>(null);

  // HTML VARIABLE
  currentHtmlUrl = signal<string | null>(null);
  jsonDiapoHtml = signal<IJsonDiapoHtml | null>(null);

  imageIsReady = signal<boolean>(false);

  getJsonImg({ lessonId, seq }: { lessonId: string; seq: string }) {
    const url = `${this._imgUrl}/${lessonId}/seq/${seq}.json`;
    return this._imgApiService.getJsonDiapo(url).pipe(
      map((res: IJSONDiapoXML | IJsonDiapoEps | IJsonDiapoPdf | IJsonDiapoHtml) => {
        switch (this.type()) {
          case 'xml':
            this._handleJsonXml(res as IJSONDiapoXML);
            break;
          case 'eps':
            this._handleJsonEps(res as IJsonDiapoEps);
            break;
          case 'pdf':
            this._handleJsonPdf(res as IJsonDiapoPdf);
            break;
          case 'html':
            this._handleJsonHtml(res as IJsonDiapoHtml);
            break;
        }
        return res;
      }),
    );
  }

  initVariables(data: IJSONDiapoXML | IJsonDiapoEps | IJsonDiapoPdf | IJsonDiapoHtml | ILesson) {
    console.log('[DiapoService]: initVariables', this.type(), data);
    switch (this.type()) {
      case 'xml':
        this._handleJsonXml(data as IJSONDiapoXML);
        break;
      case 'eps':
        this._handleJsonEps(data as IJsonDiapoEps);
        break;
      case 'pdf':
        this._handleJsonPdf(data as IJsonDiapoPdf);
        break;
      case 'html':
        this._handleJsonHtml(data as IJsonDiapoHtml);
        break;
    }
  }

  _handleJsonXml(xml: IJSONDiapoXML) {
    this.currentJsonXml.set(xml);

    if (xml.url) {
      this.xmlFetch(xml.url)
        .pipe(
          map((content: string) => {
            this.currentXmlUrl.set(content);
            return content;
          }),
        )
        .subscribe();
    }
  }

  _handleJsonEps(eps: IJsonDiapoEps) {
    this.jsonDiapoEps.set(eps as any);
    if (eps.imageList && eps.imageList.length > 0) {
      this.currentImageListEps.set(eps.imageList);
      // Initial position from JSON if any, else 1
      this.currentImageListPos.set(eps.pos || 1);
    }
  }

  _handleJsonPdf(pdf: IJsonDiapoPdf) {
    this.jsonDiapoPdf.set(pdf as any);
    if (pdf.pos) {
      this.currentImageListPos.set(pdf.pos);
    }
    if (pdf.url) {
      this.loadPdfBlob(pdf.url).subscribe();
    }
  }

  _handleJsonHtml(html: IJsonDiapoHtml) {
    this.jsonDiapoHtml.set(html);
    if (html.url) {
      this.currentHtmlUrl.set(html.url);
    }
  }

  loadPdfBlob(url: string) {
    return this._imgApiService.getPdfBlob(url).pipe(
      map((blob: Blob) => {
        this.currentPdfBlob.set(blob);
        const blobUrl = URL.createObjectURL(blob);
        this.currentPdfUrl.set(`${blobUrl}#toolbar=0`);
        return blob;
      }),
    );
  }

  xmlFetch(xmlUrl: string) {
    return this._imgApiService.getXml(xmlUrl);
  }
}

@Injectable({
  providedIn: 'root',
})
export class DiapoApiService {
  private _http = inject(HttpClient);

  getJsonDiapo(url: string): Observable<any> {
    return this._http.get<any>(url);
  }

  getPdfBlob(url: string): Observable<Blob> {
    return this._http.get(url, { responseType: 'blob' });
  }

  getXml(url: string): Observable<string> {
    return this._http.get(url, { responseType: 'text' });
  }
}
