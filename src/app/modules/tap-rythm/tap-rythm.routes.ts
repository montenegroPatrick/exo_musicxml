import { Routes } from '@angular/router';
import { TapRythmPage } from './tap-rythm.component';
import { flatResolver } from '@app/modules/tap-rythm/resolver/flat-resolver.service';

export default [
  {
    path: '',
    component: TapRythmPage,
    resolve: { flat: flatResolver },
  },
  {
    path: ':seq',
    component: TapRythmPage,
    resolve: { flat: flatResolver },
  },
] as Routes;
