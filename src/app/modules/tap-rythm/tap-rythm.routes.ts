import { Routes } from '@angular/router';
import { TapRythmPageComponent } from './tap-rythm.component';
import { flatResolver } from '@app/modules/tap-rythm/resolver/flat-resolver.service';

export default [
  {
    path: '',
    component: TapRythmPageComponent,
    resolve: { flat: flatResolver },
  },
  {
    path: ':seq',
    component: TapRythmPageComponent,
    resolve: { flat: flatResolver },
  },
] as Routes;
