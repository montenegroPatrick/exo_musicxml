import { Component, computed, Inject, inject } from '@angular/core';
import { VideoComponent } from '@core/shared/video/video.component';
import { ImgComponent } from '../img/img.component';
import { VideoImgStateService } from './services/video-img.service';
import { ImgStateService } from '../img/services/img.service';
import { XmlComponent } from '@core/shared/xml/xml.component';

@Component({
  selector: 'app-video-img',
  imports: [VideoComponent, ImgComponent],
  templateUrl: './video-img.component.html',
})
export class VideoImgComponent {
  private videoImgStateService = inject(VideoImgStateService);
  private imgStateService = inject(ImgStateService);
  typeImg = computed(() => this.videoImgStateService.typeImg());
  currentVideo = computed(() => this.videoImgStateService.jsonVideo()?.jw!);
}
