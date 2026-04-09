import { Component, computed, inject } from '@angular/core';

import { VideoComponent } from '@core/shared/video/video.component';
import { LessonService } from '../lesson/services/lesson.service';
import { JwpService } from '@core/services/jwp.service';

@Component({
  selector: 'app-video-page',
  imports: [VideoComponent],
  template: `
    <div class="h-full w-full bg-black flex items-center justify-center p-2 sm:p-4">
      <div class="video-wrapper shadow-2xl overflow-hidden cursor-pointer"
           (click)="handleSingleClick()"
           (dblclick)="handleDoubleClick()">
        <app-video 
          [options]="{ width: '100%', height: '100%', aspectratio: undefined }" 
          typeImg="eps" 
          [mediaId]="jwPlayerId()">
        </app-video>
      </div>
    </div>
  `,
  styles: `
    .video-wrapper {
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 9;
      max-width: 100%;
      max-height: 100%;
      display: block;
    }

    app-video {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    :host ::ng-deep .jw-logo {
      transform: scale(0.6) !important;
      transform-origin: top left !important;
      opacity: 0.7 !important;
    }
  `,
})
export class VideoPage {
  private _lessonService = inject(LessonService);
  private _jwpService = inject(JwpService);
  
  jwPlayerId = computed(() => this._lessonService.jwPlayerId());

  private clickTimer: any = null;

  handleSingleClick(): void {
    if (this.clickTimer) return;
    
    this.clickTimer = setTimeout(() => {
      this._jwpService.togglePlay();
      this.clickTimer = null;
    }, 250);
  }

  handleDoubleClick(): void {
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
    this._jwpService.toggleFullscreen();
  }
}
