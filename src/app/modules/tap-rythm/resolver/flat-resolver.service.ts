import { ResolveFn } from '@angular/router';
import { TapRythmPageComponent } from '../tap-rythm.component';
import { TapRythmService } from '../services/tap-rythm.service';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';

export const flatResolver: ResolveFn<any> = (route, state): Observable<any> => {
  // Data fetching is now handled upstream by CoreDataService
  return of(true);
};
