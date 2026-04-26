import { Routes } from '@angular/router';

export const TAP_RYTHM_VEXFLOW_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tap-rythm-vexflow.component').then(
        (m) => m.TapRythmVexflowPageComponent
      ),
  },
  {
    path: 'debug',
    loadComponent: () =>
      import('./debug-vexflow.component').then(
        (m) => m.DebugVexflowComponent
      ),
  },
];
