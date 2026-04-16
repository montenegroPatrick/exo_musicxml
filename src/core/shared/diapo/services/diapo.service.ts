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
import { catchError, map, Observable, tap } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { CoreDataService } from '@core/services/core-data.service';

const STORAGE_KEY_LAYOUT = 'ims_diapo_layout_mode';
const STORAGE_KEY_POSITION = 'ims_diapo_sidebar_position';

@Injectable({
  providedIn: 'root',
})
export class DiapoStateService {
  private readonly _imgUrl = `${api_url.lesson}`;
  private readonly _imgApiService = inject(DiapoApiService);
  private readonly _sanitizer = inject(DomSanitizer);
  private readonly _coreData = inject(CoreDataService);
  
  // -- Common State Signals --
  private readonly _type = signal<DiapoType | null>(null);
  private readonly _currentImageListPos = signal<number>(1);
  private readonly _viewMode = signal<'fit' | 'zoom'>('fit');
  private readonly _layoutMode = signal<'standard' | 'expanded' | 'half'>((localStorage.getItem(STORAGE_KEY_LAYOUT) as any) || 'standard');
  private readonly _sidebarPosition = signal<'left' | 'right'>((localStorage.getItem(STORAGE_KEY_POSITION) as any) || 'left');
  private readonly _imageIsReady = signal<boolean>(false);

  // -- EPS State Signals --
  private readonly _jsonDiapoEps = signal<IDiapo | null>(null);
  private readonly _currentImageListEps = signal<ImageItem[] | null>(null);

  // -- PDF State Signals --
  private readonly _jsonDiapoPdf = signal<IDiapo | null>(null);
  private readonly _currentImageListPdf = signal<ImageItem[] | null>(null);
  private readonly _currentPdfBlob = signal<Blob | null>(null);
  private readonly _currentPdfUrl = signal<string | null>(null);
  private readonly _currentPdfTotalPages = signal<number>(0);

  // -- XML State Signals --
  private readonly _currentJsonXml = signal<IJSONDiapoXML | null>(null);
  readonly currentXmlUrl = this._coreData.xmlContent;

  // -- HTML State Signals --
  private readonly _currentHtmlUrl = signal<string | null>(null);
  private readonly _jsonDiapoHtml = signal<IJsonDiapoHtml | null>(null);

  // -- Public Readonly Accessors --
  readonly type = this._type.asReadonly();
  readonly currentImageListPos = this._currentImageListPos.asReadonly();
  readonly viewMode = this._viewMode.asReadonly();
  readonly layoutMode = this._layoutMode.asReadonly();
  readonly sidebarPosition = this._sidebarPosition.asReadonly();
  readonly imageIsReady = this._imageIsReady.asReadonly();

  readonly jsonDiapoEps = this._jsonDiapoEps.asReadonly();
  readonly currentImageListEps = this._currentImageListEps.asReadonly();

  readonly jsonDiapoPdf = this._jsonDiapoPdf.asReadonly();
  readonly currentImageListPdf = this._currentImageListPdf.asReadonly();
  readonly currentPdfUrl = this._currentPdfUrl.asReadonly();
  readonly currentPdfTotalPages = this._currentPdfTotalPages.asReadonly();

  readonly currentJsonXml = this._currentJsonXml.asReadonly();

  readonly jsonDiapoHtml = this._jsonDiapoHtml.asReadonly();
  readonly currentHtmlUrl = this._currentHtmlUrl.asReadonly();

  // -- Reactive Derived Signals --
  readonly currentImgEps = computed(() => {
    const list = this._currentImageListEps();
    const pos = this._currentImageListPos();
    if (!list || list.length === 0) return null;
    return list[Math.max(0, Math.min(pos - 1, list.length - 1))];
  });

  readonly currentImgPdf = computed(() => {
    const list = this._currentImageListPdf();
    const pos = this._currentImageListPos();
    if (!list || list.length === 0) return null;
    return list[Math.max(0, Math.min(pos - 1, list.length - 1))];
  });

  // -- Public Actions --

  setType(type: DiapoType | null): void {
    this._type.set(type);
  }

  setPos(pos: number): void {
    this._currentImageListPos.set(pos);
  }

  setViewMode(mode: 'fit' | 'zoom'): void {
    this._viewMode.set(mode);
  }

  setLayoutMode(mode: 'standard' | 'expanded' | 'half'): void {
    this._layoutMode.set(mode);
    localStorage.setItem(STORAGE_KEY_LAYOUT, mode);
  }

  setSidebarPosition(pos: 'left' | 'right'): void {
    this._sidebarPosition.set(pos);
    localStorage.setItem(STORAGE_KEY_POSITION, pos);
  }

  setPdfTotalPages(count: number): void {
    this._currentPdfTotalPages.set(count);
  }

  getJsonImg({ lessonId, seq }: { lessonId: string; seq: string }): Observable<any> {
    const url = `${this._imgUrl}/${lessonId}/seq/${seq}.json`;
    return this._imgApiService.getJsonDiapo(url).pipe(
      map((res: IJSONDiapoXML | IJsonDiapoEps | IJsonDiapoPdf | IJsonDiapoHtml) => {
        this.initVariables(res);
        return res;
      }),
    );
  }

  initVariables(data: IJSONDiapoXML | IJsonDiapoEps | IJsonDiapoPdf | IJsonDiapoHtml | ILesson): void {
    switch (this._type()) {
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
      default:
        // Fallback pour les leçons standard qui contiennent des images directement
        this._handleJsonEps(data as ILesson);
        break;
    }
  }

  private _handleJsonXml(xml: IJSONDiapoXML): void {
    this._currentJsonXml.set(xml);
    // Note: FETCH logic is now handled by LessonService/CoreDataService centrally
  }

  private _handleJsonEps(eps: IJsonDiapoEps | ILesson): void {
    this._jsonDiapoEps.set(eps as any);
    const list = (eps as any).imageList || (eps as any).ImageList;
    if (list && Array.isArray(list) && list.length > 0) {
      this._currentImageListEps.set(list || null);
      this._currentImageListPos.set(eps.pos || 1);
    }
  }

  private _handleJsonPdf(pdf: IJsonDiapoPdf): void {
    this._jsonDiapoPdf.set(pdf as any);
    if (pdf.pos) {
      this._currentImageListPos.set(pdf.pos);
    }
    if (pdf.url) {
      this._imgApiService.getPdfBlob(pdf.url).pipe(
        map((blob: Blob) => {
          this._currentPdfBlob.set(blob);
          const blobUrl = URL.createObjectURL(blob);
          this._currentPdfUrl.set(`${blobUrl}#toolbar=0`);
          return blob;
        })
      ).subscribe();
    }
  }

  private _handleJsonHtml(html: IJsonDiapoHtml): void {
    this._jsonDiapoHtml.set(html);
    if (html.url) {
      this._currentHtmlUrl.set(html.url);
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class DiapoApiService {
  private readonly _http = inject(HttpClient);

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
