import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { VideoService } from '../services/video.service';

export const videoResolver: ResolveFn<unknown> = (route, state) => {
  // TODO: Implement resolver logic
  const { lessonId, seq } = route.params;
  const videoService = inject(VideoService);

  return videoService.getVideoJson({ seq, lessonId });
};
