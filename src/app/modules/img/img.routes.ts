import { Routes } from '@angular/router';
import { ImgComponent } from './img.component';
import { imgResolver } from './resolvers/img.resolver';

export default [
  {
    path: ':type/:lessonId/:seq',
    component: ImgComponent,
    resolve: {
      img: imgResolver,
    },
  },
];
