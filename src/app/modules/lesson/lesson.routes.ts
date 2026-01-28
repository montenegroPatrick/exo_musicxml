import { Routes } from '@angular/router';
import { LessonContainerComponent } from './lesson-container.component';
import { lessonResolver } from './resolvers/lesson.resolver';
import { VideoPage } from '../video/video-page.component';
import { VideoImgComponent } from '../video-img/video-img.component';
import { ImgComponent } from '../img/img.component';

export default [
  {
    path: ':lessonId/:seq',
    component: LessonContainerComponent,
    resolve: { lesson: lessonResolver },
    children: [
      {
        path: 'video',
        component: VideoPage,
      },
      {
        path: 'video-img',
        component: VideoImgComponent,
      },
      {
        path: 'img',
        component: ImgComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'video',
      },
    ],
  },
] as Routes;
