import { Routes } from '@angular/router';
import { VideoPage } from './video-page.component';
import { videoResolver } from './resolvers/video.resolver';

export default [
  {
    path: '',
    component: VideoPage,
    resolve: {
      video: videoResolver,
    },
  },
] as Routes;
