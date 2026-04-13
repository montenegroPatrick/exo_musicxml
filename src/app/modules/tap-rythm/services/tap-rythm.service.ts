import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { EnvironmentInjector, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { api_url } from 'src/core/constant/api_url';
import { IJsonXml, Level } from '../interface/flat.interface';
import { CoreDataService } from '@core/services/core-data.service';

@Injectable({
  providedIn: 'root',
})
@Injectable({
  providedIn: 'root',
})
export class TapRythmService {
  static readonly FLAT_APP_ID = environment.FLAT_APP_ID;
  private readonly _http = inject(HttpClient);
  private readonly _coreData = inject(CoreDataService);
  
  // -- Private Writable Signals (Processed Data) --
  private readonly _jsonXml = signal<IJsonXml>({});
  private readonly _jsonXmlOriginal = signal<IJsonXml>({}); // Keeping cache for speed scaling
  private readonly _isError = signal<boolean>(false);

  // -- Public Readonly Accessors --
  readonly musicXml = this._coreData.xmlContent;
  readonly jsonXml = this._jsonXml.asReadonly();
  readonly isError = this._isError.asReadonly();

  /**
   * Fetches the MusicXML file for a specific sequence.
   * On success, also triggers the fetch for the companion JSON data.
   */
  xmlFetch(seq: string): Observable<HttpResponse<string | null>> {
    const url = `${api_url.exoMusicXml}${seq}.musicxml`;
    const headers = new HttpHeaders({
      'Content-Type': 'text/xml',
      'Cache-Control': 'no-cache',
    });

    return this._http.get(url, { responseType: 'text', observe: 'response', headers }).pipe(
      map((res: HttpResponse<string | null>) => {
        if (res.status === 200 && res.body) {
          this._coreData.setXmlContent(res.body);
          this._isError.set(false);
          this.getJsonFile(seq).subscribe();
        } else {
          this._isError.set(true);
        }
        return res;
      }),
      catchError((error) => {
        console.error('[TapRythmService]: Error fetching XML', error);
        this._isError.set(true);
        return of(new HttpResponse({ body: null, status: error.status || 500 }));
      })
    );
  }

  /**
   * Fetches the JSON companion file for scoring and metadata.
   */
  getJsonFile(seq: string): Observable<HttpResponse<IJsonXml | null>> {
    const url = `${api_url.exoMusicXml}${seq}.json`;
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });

    return this._http.get<IJsonXml>(url, { observe: 'response', headers }).pipe(
      map((res: HttpResponse<IJsonXml | null>) => {
        if (res.status === 200 && res.body) {
          this._coreData.setExercisePayload(res.body);
          this._jsonXmlOriginal.set(res.body);
          this._jsonXml.set(res.body);
          this._isError.set(false);
        } else {
          this._isError.set(true);
        }
        return res;
      }),
      catchError((error) => {
        console.error('[TapRythmService]: Error fetching JSON', error);
        this._isError.set(true);
        return of(new HttpResponse({ body: null, status: error.status || 500 }));
      })
    );
  }

  /**
   * Scales note timings based on completion level (speed factor).
   */
  changeSpeedNotes(speed: Level): void {
    const original = this._jsonXmlOriginal();
    
    if (speed === 1) {
      this._jsonXml.set(original);
      return;
    }

    if (original.notes) {
      this._jsonXml.set({
        ...original,
        duration: (original.duration ?? 100000) / speed,
        notes: original.notes.map(note => note / speed),
      });
    }
  }
}
