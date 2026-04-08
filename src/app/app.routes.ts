import { Routes } from '@angular/router';
import { TapRythmPage } from './modules/tap-rythm/tap-rythm.component';
import { authGuard } from 'src/core/guard/auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { NotfoundComponent } from './not-found/notfound.component';
import { flatResolver } from './modules/tap-rythm/resolver/flat-resolver.service';
import { ExecutionShellComponent } from './modules/executor/execution-shell.component';
import { executorResolver } from './modules/executor/resolver/executor.resolver';

export const routes: Routes = [
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: '',
    component: ExecutionShellComponent,
    resolve: { data: executorResolver },
    children: [
      // Direct Executor Routes (Flat)
      {
        path: 'video',
        data: { showNavigation: true },
        loadComponent: () => import('./modules/video/video-page.component').then(m => m.VideoPage),
      },
      {
        path: 'video-img',
        data: { showNavigation: true },
        loadComponent: () => import('./modules/video-img/video-img.component').then(m => m.VideoImgComponent),
      },
      {
        path: 'images',
        data: { showNavigation: true },
        loadComponent: () => import('./modules/img/img.component').then(m => m.ImgComponent),
      },
      {
        path: 'tap-rythm',
        data: { showNavigation: true },
        loadComponent: () => import('./modules/tap-rythm/tap-rythm.component').then(m => m.TapRythmPage),
      },
      {
        path: 'music-xml',
        data: { showNavigation: true },
        loadComponent: () => import('./modules/video/video-page.component').then(m => m.VideoPage),
      },
      {
        path: 'playback',
        data: { showNavigation: false },
        loadComponent: () => import('./modules/img/img.component').then(m => m.ImgComponent),
      },
      {
        path: 'drummachine',
        data: { showNavigation: false, controlBar: 'drummachine' },
        loadComponent: () => import('./modules/video/video-page.component').then(m => m.VideoPage),
      },
      // Root redirect
      {
        path: '',
        redirectTo: 'video',
        pathMatch: 'full'
      }
    ],
  },
  {
    path: '**',
    component: NotfoundComponent,
  },
];
