import { Routes } from '@angular/router';
import { FlatComponent } from './flat.component';
import { flatResolver } from '@app/flat/resolver/flat-resolver.service';

export default [
  {
    path: '',
    component: FlatComponent,
    resolve: { flat: flatResolver },
  },
  {
    path: ':seq',
    component: FlatComponent,
    resolve: { flat: flatResolver },
  },
] as Routes;
