import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ILesson } from '@core/interfaces/lesson.interface';
import { FlutterBridgeService } from '@core/services/flutter-bridge.service';
import { LessonService } from '../services/lesson.service';

export const lessonResolver: ResolveFn<ILesson> = (route, state) => {
  inject(FlutterBridgeService);
  const { lessonId, seq } = route.params;
  const lessonService = inject(LessonService);

  if (!lessonId || !seq) {
    throw new Error('lessonId and seq are required');
  }

  return lessonService.fetchLesson(lessonId, seq);
};
