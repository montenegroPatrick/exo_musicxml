import { Routes } from '@angular/router';
import { VideoImgComponent } from './video-img.component';
import { videoImgResolver } from './resolvers/video-img.resolver';

export default [
  {
    path: ':typeImg/:lessonId/:seq',
    component: VideoImgComponent,
    resolve: {
      resolver: videoImgResolver,
    },
  },
];
