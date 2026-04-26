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
    path: 'debug',
    loadComponent: () => import('./modules/debug/debug-page.component').then(m => m.DebugPageComponent),
  },
  {
    path: '',
    component: ExecutionShellComponent,
    resolve: { data: executorResolver },
    children: [
      {
        path: 'playback-score',
        data: { controlBar: 'audio-mixer' },
        loadComponent: () => import('./modules/audiomixer/audiomixer-page.component').then(m => m.AudioMixerPageComponent),
      },
      {
        path: 'playback-diapo',
        data: { controlBar: 'audio-mixer' },
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
        path: 'metronome-diapo',
        data: { controlBar: 'metronome' },
        loadComponent: () => import('./modules/metronome-diapo/metronome-diapo.component').then(m => m.MetronomeDiapoComponent),
      },
      {
        path: 'playback-diapo',
        data: { controlBar: 'audiomixer' },
        loadComponent: () => import('./modules/playback-diapo/playback-diapo.component').then(m => m.PlaybackDiapoComponent),
      },
      {
        path: 'tap-rythm',
        data: { },
        loadComponent: () => import('./modules/tap-rythm/tap-rythm.component').then(m => m.TapRythmPageComponent),
      },
      {
        path: 'tap-rythm-vexflow',
        data: { hideControlBar: true },
        loadChildren: () => import('./modules/tap-rythm-vexflow/tap-rythm-vexflow.routes').then(m => m.TAP_RYTHM_VEXFLOW_ROUTES),
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
