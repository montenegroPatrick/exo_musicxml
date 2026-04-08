import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ILesson } from '@core/interfaces/lesson.interface';
import { catchError, of } from 'rxjs';
import { LessonService } from '../../lesson/services/lesson.service';

export const executorResolver: ResolveFn<ILesson | null> = (route, _state) => {
  const lessonService = inject(LessonService);
  const moduleName = route.url[0]?.path || 'video';

  // Force mock via query param (dev/debug only)
  const mockFile = route.queryParamMap.get('mock');
  if (mockFile) {
    return lessonService.loadTestData(mockFile).pipe(catchError(() => of(null)));
  }

  // Try to get data from Flutter, fallback to mock automatically
  return lessonService.loadData('init', moduleName).pipe(catchError(() => of(null)));
};
