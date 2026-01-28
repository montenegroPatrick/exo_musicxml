import { Routes } from '@angular/router';
import { TapRythmPage } from './modules/tap-rythm/tap-rythm.component';
import { authGuard } from 'src/core/guard/auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { NotfoundComponent } from './not-found/notfound.component';
import { flatResolver } from './modules/tap-rythm/resolver/flat-resolver.service';

export const routes: Routes = [
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: '',
    canActivate: [],
    children: [
      {
        path: 'tap-rythm',
        component: TapRythmPage,
        resolve: { flat: flatResolver },
      },
      {
        path: 'lesson',
        loadChildren: () => import('./modules/lesson/lesson.routes'),
      },
    ],
  },
  {
    path: '**',
    component: NotfoundComponent,
  },
];
