import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ILesson } from '@core/interfaces/lesson.interface';
import { BridgeService } from '@core/services/bridge.service';
import { catchError, Observable, of } from 'rxjs';
import { LessonService } from '../../lesson/services/lesson.service';

/**
 * Resolver that loads test data if needed.
 * In a real scenario, this would check if the bridge has already provided data,
 * or if we should load from a mock file based on the route or query params.
 */
export const executorResolver: ResolveFn<ILesson | null> = (route, state) => {
  const lessonService = inject(LessonService);
  const bridgeService = inject(BridgeService);
  const moduleName = route.url[0]?.path || 'video';
  // If we already have data in the service, we can skip loading
  // if (lessonService.lessonJson()) {
  //   return of(lessonService.lessonJson());
  // }

  // Check for mock parameter in query string
  const mockFile = route.queryParamMap.get('mock');

  if (mockFile) {
    return lessonService
      .loadTestData(mockFile)
      .pipe(catchError(() => of(null)));
  }

  // Default to loading mock data matching the module name for testing
  return lessonService
    .loadTestData(moduleName)
    .pipe(catchError(() => of(null)));
};
