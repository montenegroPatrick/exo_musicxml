import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { EnvironmentInjector, inject, Injectable, signal, effect } from '@angular/core';
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
  private readonly _coreData = inject(CoreDataService);
  
  // -- Private Writable Signals (Processed Data) --
  private readonly _jsonXml = signal<IJsonXml>({});
  private readonly _jsonXmlOriginal = signal<IJsonXml>({}); // Keeping cache for speed scaling

  // -- Public Readonly Accessors --
  readonly musicXml = this._coreData.xmlContent;
  readonly jsonXml = this._jsonXml.asReadonly();
  
  // Since we rely on CoreDataStore which manages its own error state if needed,
  // we can map isError to a simple false or link it to CoreDataStore's error state.
  readonly isError = signal<boolean>(false).asReadonly();

  constructor() {
    // Reactively update local JSON state when the unified store updates
    effect(() => {
      const payload = this._coreData.exercisePayload() as IJsonXml;
      if (payload && payload.notes) {
        // Only set if we actually have notes, to avoid resetting on empty payloads
        this._jsonXmlOriginal.set(payload);
        this._jsonXml.set(payload);
      }
    }, { allowSignalWrites: true });
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
