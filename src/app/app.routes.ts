import { Routes } from '@angular/router';
import { FlatComponent } from './flat/flat.component';
import { authGuard } from 'src/core/guard/auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { NotfoundComponent } from './not-found/notfound.component';
import { flatResolver } from './flat/resolver/flat-resolver.service';

export const routes: Routes = [
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: '',

<<<<<<< HEAD
    canActivate: [],
=======
    // canActivate: [authGuard],
>>>>>>> 1a47ec4 (pas mal)
    loadChildren: () => import('./flat/flat.routes'),
    resolve: { flat: flatResolver },
  },
  {
    path: '**',
    component: NotfoundComponent,
  },
];
