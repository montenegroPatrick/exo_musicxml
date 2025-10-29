import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { EnvironmentInjector, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { api_url } from 'src/core/constant/api_url';
import { IJsonXml } from '../interface/flat.interface';
import { Level } from '../models/tap.model';

@Injectable({
  providedIn: 'root',
})
export class TapRythmService {
  private _http = inject(HttpClient);
  static readonly FLAT_APP_ID = environment.FLAT_APP_ID;

  musicXml = signal<string>('');
  jsonXmlOriginal = signal<IJsonXml>({});
  jsonXml = signal<IJsonXml>({});
  isError = signal<boolean>(false);

  xmlFetch(seq: string): Observable<HttpResponse<string | null>> {
    // to determinate the seq, we need to get the seq from the url

    const url = `${api_url.exoMusicXml}${seq}.musicxml`;
    return this._http
      .get(url, {
        responseType: 'text',
        observe: 'response',
        headers: new HttpHeaders({
          'Content-Type': 'text/xml',
          'cache-control': 'no-cache',
        }),
      })
      .pipe(
        map((res: HttpResponse<string | null>) => {
          if (res.status === 200 && res.body != null) {
            this.musicXml.set(res.body!);
            this.isError.set(false);
            this.getJsonFile(seq).subscribe();
          } else {
            this.isError.set(true);
          }
          return res;
        }),
        catchError((error) => {
          console.error('Erreur lors du fetch XML:', error);
          this.isError.set(true);
          // Retourne une réponse vide pour permettre au resolver de continuer
          return of(
            new HttpResponse({ body: null, status: error.status || 500 })
          );
        })
      );
  }
  getJsonFile(seq: string): Observable<HttpResponse<IJsonXml | null>> {
    const url = `${api_url.exoMusicXml}${seq}.json`;
    return this._http
      .get(url, {
        observe: 'response',
        headers: new HttpHeaders({
          'cache-control': 'no-cache',
        }),
      })
      .pipe(
        map((res: HttpResponse<any>) => {
          if (res.status === 200 && res.body != null) {
            this.jsonXmlOriginal.set(res.body!);
            this.jsonXml.set(res.body!);
            this.isError.set(false);
          } else {
            this.isError.set(true);
          }
          return res;
        }),
        catchError((error) => {
          console.error('Erreur lors du fetch JSON:', error);
          this.isError.set(true);
          return of(
            new HttpResponse({ body: null, status: error.status || 500 })
          );
        })
      );
  }
  changeSpeedNotes(speed: Level): void {
    if (speed === 1) {
      this.jsonXml.set(this.jsonXmlOriginal());
      return;
    }

    this.jsonXml.update((jsonXml) => {
      if (jsonXml.notes) {
        return {
          ...jsonXml,
          duration: (this.jsonXmlOriginal()?.duration ?? 100000) / speed,
          notes: this.jsonXmlOriginal()?.notes?.map((note) => note / speed),
        };
      }
      return jsonXml;
    });
  }
}
