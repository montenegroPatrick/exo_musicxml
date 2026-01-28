import { Component, computed, inject, OnInit } from '@angular/core';
import { VideoComponent } from '@core/shared/video/video.component';
import { ImgComponent } from '../img/img.component';
import { ImgStateService } from '../img/services/img.service';
import { ControlBarComponent } from '../control-bar/control-bar.component';
import { JwpService } from '@core/services/jwp.service';
import { FlatService } from '@core/services/flat.service';
import { LessonService } from '../lesson/services/lesson.service';

@Component({
  selector: 'app-video-img',
  imports: [VideoComponent, ImgComponent, ControlBarComponent],
  templateUrl: './video-img.component.html',
})
export class VideoImgComponent implements OnInit {
  private _lessonService = inject(LessonService);
  private _imgStateService = inject(ImgStateService);
  private _jwpService = inject(JwpService);
  private _flatService = inject(FlatService);

  typeImg = computed(() => this._lessonService.imgType() ?? 'eps');
  currentVideo = computed(() => this._lessonService.jwPlayerId());
  videoIsReady = computed(() => this._jwpService.isReady());
  xmlIsReady = computed(() => this._flatService.isReady());

  ngOnInit(): void {
    // Initialize ImgStateService with lesson data
    const lesson = this._lessonService.lessonJson();
    const imgType = this._lessonService.imgType();

    if (lesson && imgType) {
      this._imgStateService.type.set(imgType);
      this._imgStateService.initVariables(lesson);
    }
  }
}
