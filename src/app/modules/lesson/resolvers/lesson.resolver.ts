import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { LessonService } from '../services/lesson.service';
import { ILesson } from '@core/interfaces/lesson.interface';

export const lessonResolver: ResolveFn<ILesson> = (route, state) => {
  const { lessonId, seq } = route.params;
  const lessonService = inject(LessonService);

  if (!lessonId || !seq) {
    throw new Error('lessonId and seq are required');
  }

  return lessonService.fetchLesson(lessonId, seq);
};
