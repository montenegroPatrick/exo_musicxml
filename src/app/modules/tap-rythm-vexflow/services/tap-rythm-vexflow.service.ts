import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ITapRythmVexflowData } from '../interfaces/tap-rythm-vexflow.interface';

@Injectable({
  providedIn: 'root',
})
export class TapRythmVexflowService {
  private readonly _http = inject(HttpClient);
  
  private readonly _data = signal<ITapRythmVexflowData | null>(null);
  private readonly _isError = signal<boolean>(false);

  readonly data = this._data.asReadonly();
  readonly isError = this._isError.asReadonly();

  loadExercise(filename: string): Observable<ITapRythmVexflowData | null> {
    const url = `/assets/test-data/${filename}`;
    console.log(`[TapRythmVexflowService] Loading: ${url}`);
    
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' });
    
    return this._http.get<ITapRythmVexflowData>(url, { headers }).pipe(
      tap((data) => {
        console.log('[TapRythmVexflowService] JSON data received:', data);
        this._data.set(data);
        this._isError.set(false);
      }),
      catchError((error) => {
        console.error('[TapRythmVexflowService]: Error loading exercise', error);
        this._isError.set(true);
        return of(null);
      })
    );
  }
}
