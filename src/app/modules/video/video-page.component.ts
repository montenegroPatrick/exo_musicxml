import { Component, computed, inject } from '@angular/core';

import { VideoComponent } from '@core/shared/video/video.component';
import { VideoService } from './services/video.service';

@Component({
  selector: 'app-video-page',
  imports: [VideoComponent],
  template: `
    <div class="h-screen w-full bg-black  ">
      <app-video [mediaId]="jwPlayerId()"></app-video>
    </div>
  `,
  styles: ``,
})
export class VideoPage {
  private _videoService = inject(VideoService);
  videoJson = computed(() => this._videoService.videoJson());
  jwPlayerId = computed(() => this.videoJson()?.jw ?? '');
}
