import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { VideoComponent } from '@core/shared/video/video.component';
import { ImgComponent } from '../img/img.component';
import { ImgStateService } from '../img/services/img.service';
import { ControlBarComponent } from '../control-bar/control-bar.component';
import { JwpService } from '@core/services/jwp.service';
import { FlatService } from '@core/services/flat.service';
import { LessonService } from '../lesson/services/lesson.service';
import {
  Iposition,
  Iratio,
  IVideoImgLayout,
} from './interfaces/video-img.interface';
import { ButtonModule } from 'primeng/button';
export const defaultVideoImgLayout: IVideoImgLayout = {
  imageRatio: '1/2',
  imgPosition: 'top',
};
@Component({
  selector: 'app-video-img',
  imports: [VideoComponent, ImgComponent, ControlBarComponent, ButtonModule],
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
  videoImgLayout: WritableSignal<IVideoImgLayout> = signal<IVideoImgLayout>(
    defaultVideoImgLayout,
  );
  classImgContainer = computed(() => {
    const ratio = this.videoImgLayout().imageRatio;
    const position = this.videoImgLayout().imgPosition;
    switch (ratio) {
      case '1/2':
        return 'col-span-3';
      case '1/3':
        return 'col-span-2';
      case '1/4':
        return 'col-span-1';
      case 'full':
        return 'col-span-4';
      default:
        return 'col-span-1';
    }
  });
  classVideoContainer = computed(() => {
    const ratio = this.videoImgLayout().imageRatio;
    switch (ratio) {
      case '1/2':
        return 'col-span-1';
      case '1/3':
        return 'col-span-2';
      case '1/4':
        return 'col-span-3';
      case 'full':
        return 'col-span-4';
      default:
        return 'col-span-2';
    }
  });

  ngOnInit(): void {
    // Initialize ImgStateService with lesson data
    const lesson = this._lessonService.lessonJson();
    const imgType = this._lessonService.imgType();

    if (lesson && imgType) {
      this._imgStateService.type.set(imgType);
      this._imgStateService.initVariables(lesson);
    }
  }
  changeLayout(ratio: Iratio) {
    this.videoImgLayout.update((layout) => ({
      ...layout,
      imageRatio: ratio,
    }));
  }
  changePosition(position: Iposition) {
    this.videoImgLayout.update((layout) => ({
      ...layout,
      imgPosition: position,
    }));
  }
}
