import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ImgStateService } from '../services/img.service';

export const imgResolver: ResolveFn<unknown> = (route, state) => {
  const { type, lessonId, seq } = route.params;
  const imgService = inject(ImgStateService);
  if (!type) {
    throw new Error('type is required');
  }
  let typeImg = type == '' || type == null ? 'eps' : type;

  imgService.type.set(typeImg);

  return imgService.getJsonImg({ lessonId, seq });
};
