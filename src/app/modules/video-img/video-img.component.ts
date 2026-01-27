import { Component, computed, Inject, inject } from '@angular/core';
import { VideoComponent } from '@core/shared/video/video.component';
import { ImgComponent } from '../img/img.component';
import { VideoImgStateService } from './services/video-img.service';
import { ImgStateService } from '../img/services/img.service';
import { XmlComponent } from '@core/shared/xml/xml.component';
import { ControlBarComponent } from '../control-bar/control-bar.component';
import { JwpService } from '@core/services/jwp.service';
import { FlatService } from '@core/services/flat.service';

@Component({
  selector: 'app-video-img',
  imports: [VideoComponent, ImgComponent, ControlBarComponent],
  templateUrl: './video-img.component.html',
})
export class VideoImgComponent {
  private videoImgStateService = inject(VideoImgStateService);
  private imgStateService = inject(ImgStateService);
  private jwpService = inject(JwpService);
  private flatService = inject(FlatService);

  typeImg = computed(() => this.videoImgStateService.typeImg());
  currentVideo = computed(() => this.videoImgStateService.jsonVideo()?.jw!);
  videoIsReady = computed(() => this.jwpService.isReady());
  xmlIsReady = computed(() => this.flatService.isReady());
}
