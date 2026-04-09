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
        path: 'video-diapo',
        data: { showNavigation: true },
        loadComponent: () => import('./modules/video-diapo/video-diapo.component').then(m => m.VideoDiapoComponent),
      },
      {
        path: 'diapo',
        data: { showNavigation: true },
        loadComponent: () => import('./modules/diapo/diapo.component').then(m => m.DiapoComponent),
      },
      {
        path: 'tap-rythm',
        data: { showNavigation: true },
        loadComponent: () => import('./modules/tap-rythm/tap-rythm.component').then(m => m.TapRythmPage),
      },
      {
        path: 'music-xml',
        data: { showNavigation: true },
        loadComponent: () => import('./modules/diapo/diapo.component').then(m => m.DiapoComponent),
      },
      {
        path: 'playback',
        data: { showNavigation: false },
        loadComponent: () => import('./modules/diapo/diapo.component').then(m => m.DiapoComponent),
      },
      {
        path: 'drummachine',
        data: { showNavigation: false, controlBar: 'drummachine' },
        loadComponent: () => import('./modules/video/video-page.component').then(m => m.VideoPage),
      },
      {
        path: 'metronome',
        data: { showNavigation: false, hideControlBar: true },
        loadComponent: () => import('./modules/metronome/metronome-page.component').then(m => m.MetronomePage),
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
