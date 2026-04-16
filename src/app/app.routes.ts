import { Routes } from '@angular/router';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { NotfoundComponent } from './not-found/notfound.component';
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
      {
        path: 'lesson-playback',
        data: { controlBar: 'audiomixer' },
        loadComponent: () => import('./modules/audiomixer/audiomixer-page.component').then(m => m.AudioMixerPageComponent),
      },
      {
        path: 'video',
        data: { },
        loadComponent: () => import('./modules/video/video-page.component').then(m => m.VideoPageComponent),
      },
      {
        path: 'video-diapo',
        data: { },
        loadComponent: () => import('./modules/video-diapo/video-diapo.component').then(m => m.VideoDiapoComponent),
      },
      {
        path: 'video-score',
        data: { controlBar: 'video-xml' },
        loadComponent: () => import('./modules/video-score/video-score.component').then(m => m.VideoScoreComponent),
      },
      {
        path: 'diapo',
        data: { },
        loadComponent: () => import('@core/shared/diapo/diapo.component').then(m => m.DiapoComponent),
      },
      {
        path: 'tap-rythm',
        data: { },
        loadComponent: () => import('./modules/tap-rythm/tap-rythm.component').then(m => m.TapRythmPageComponent),
      },
      {
        path: 'music-xml',
        data: { },
        loadComponent: () => import('@core/shared/diapo/diapo.component').then(m => m.DiapoComponent),
      },
      {
        path: 'drummachine',
        data: { controlBar: 'drummachine' },
        loadComponent: () => import('./modules/video/video-page.component').then(m => m.VideoPageComponent),
      },
      {
        path: 'metronome',
        data: { hideControlBar: true },
        loadComponent: () => import('./modules/metronome/metronome-page.component').then(m => m.MetronomePageComponent),
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
