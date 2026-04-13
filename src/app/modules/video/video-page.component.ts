import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { VideoComponent } from '@core/shared/video/video.component';
import { CoreDataService } from '@core/services/core-data.service';

@Component({
  selector: 'app-video-page',
  standalone: true,
  imports: [VideoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="video-container-wrapper bg-zinc-950 h-full w-full overflow-hidden">
      <app-video 
        mode="fill"
        typeImg="none" 
        [mediaId]="jwPlayerId()">
      </app-video>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #09090b; /* zinc-950 */
      overflow: hidden;
    }

    .video-container-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }

    app-video {
      display: block;
      width: 100%;
      height: 100%;
    }
  `],
})
export class VideoPageComponent {
  private readonly _coreData = inject(CoreDataService);
  
  /** Reactive source for the current lesson's JWPlayer ID */
  readonly jwPlayerId = this._coreData.jwPlayerId;
}
