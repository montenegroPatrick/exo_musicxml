import { Component, computed, inject } from '@angular/core';

import { VideoComponent } from '@core/shared/video/video.component';
import { LessonService } from '../lesson/services/lesson.service';
import { JwpService } from '@core/services/jwp.service';

@Component({
  selector: 'app-video-page',
  standalone: true,
  imports: [VideoComponent],
  template: `
    <div class="h-full w-full bg-black flex items-center justify-center p-2 sm:p-4">
      <app-video 
        mode="fixed-ratio"
        typeImg="eps" 
        [mediaId]="jwPlayerId()">
      </app-video>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    app-video {
      width: 100%;
      max-width: 1200px;
    }
  `,
})
export class VideoPage {
  private _lessonService = inject(LessonService);
  jwPlayerId = computed(() => this._lessonService.jwPlayerId());
}
