import { Component } from '@angular/core';
import { VideoComponent } from '@core/shared/video/video.component';

@Component({
  selector: 'app-video-page',
  imports: [VideoComponent],
  template: `
    <div class="">
      <app-video [mediaId]="'Pl7B5udC'"></app-video>
    </div>
  `,
  styles: ``,
})
export class VideoPage {}
