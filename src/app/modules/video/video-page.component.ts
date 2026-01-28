import { Component, computed, inject } from '@angular/core';

import { VideoComponent } from '@core/shared/video/video.component';
import { LessonService } from '../lesson/services/lesson.service';

@Component({
  selector: 'app-video-page',
  imports: [VideoComponent],
  template: `
    <div class="h-screen w-full bg-black">
      <app-video typeImg="eps" [mediaId]="jwPlayerId()"></app-video>
    </div>
  `,
  styles: ``,
})
export class VideoPage {
  private _lessonService = inject(LessonService);
  jwPlayerId = computed(() => this._lessonService.jwPlayerId());
}
