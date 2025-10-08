import { HttpClient } from '@angular/common/http';
import { EnvironmentInjector, inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TapRythmService {
  private _http = inject(HttpClient);
  static readonly FLAT_APP_ID = environment.FLAT_APP_ID;

  xmlFetch(): Observable<string> {
    const url = `/TEST.musicxml`;
    return this._http.get(url, { responseType: 'text' });
  }

  constructor() {}
}
