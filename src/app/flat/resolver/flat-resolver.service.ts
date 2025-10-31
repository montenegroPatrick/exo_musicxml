import { ResolveFn } from '@angular/router';
import { FlatComponent } from '../flat.component';
import { TapRythmService } from '../services/tap-rythm.service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

export const flatResolver: ResolveFn<any> = (route, state): Observable<any> => {
  // get the seq from the url
  const seq = route.params['seq'];
  const tapRythmService = inject(TapRythmService);
  if (seq) {
    return tapRythmService.xmlFetch(seq);
  }
  return tapRythmService.xmlFetch('7');
};
