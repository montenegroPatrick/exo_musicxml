import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { VideoImgStateService } from '../services/video-img.service';
import { ImgStateService } from '@app/modules/img/services/img.service';

export const videoImgResolver: ResolveFn<unknown> = (route, state) => {
  const { typeImg, lessonId, seq } = route.params;
  const videoImgStateService = inject(VideoImgStateService);
  const imageService = inject(ImgStateService);
  imageService.type.set(typeImg);

  videoImgStateService.typeImg.set(typeImg);
  videoImgStateService.lessonId.set(lessonId);
  videoImgStateService.seq.set(seq);
  return videoImgStateService.getJsonVideoImg();
};
