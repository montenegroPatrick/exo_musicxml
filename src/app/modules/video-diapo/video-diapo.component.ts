import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { VideoComponent } from '@core/shared/video/video.component';
import { DiapoComponent } from '../diapo/diapo.component';
import { DiapoStateService } from '../diapo/services/diapo.service';
import { ControlBarComponent } from '../control-bar/control-bar.component';
import { JwpService } from '@core/services/jwp.service';
import { FlatService } from '@core/services/flat.service';
import { LessonService } from '../lesson/services/lesson.service';
import { VideoSyncService } from '../lesson/services/video-sync.service';
import {
  Iposition,
  Iratio,
  IVideoDiapoLayout,
} from './interfaces/video-diapo.interface';
import { ButtonModule } from 'primeng/button';

export const defaultVideoDiapoLayout: IVideoDiapoLayout = {
  imageRatio: '1/2',
  imgPosition: 'top',
};

@Component({
  selector: 'app-video-diapo',
  imports: [VideoComponent, DiapoComponent, ControlBarComponent, ButtonModule],
  templateUrl: './video-diapo.component.html',
})
export class VideoDiapoComponent implements OnInit {
  private _lessonService = inject(LessonService);
  private _diapoService = inject(DiapoStateService);
  private _jwpService = inject(JwpService);
  private _flatService = inject(FlatService);
  private _videoSyncService = inject(VideoSyncService);

  typeImg = computed(() => this._lessonService.diapoType() ?? 'eps');
  currentVideo = computed(() => this._lessonService.jwPlayerId());
  videoIsReady = computed(() => this._jwpService.isReady());
  xmlIsReady = computed(() => this._flatService.isReady());
  videoDiapoLayout: WritableSignal<IVideoDiapoLayout> = signal<IVideoDiapoLayout>(
    defaultVideoDiapoLayout,
  );

  classImgContainer = computed(() => {
    const ratio = this.videoDiapoLayout().imageRatio;
    const position = this.videoDiapoLayout().imgPosition;
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
    const ratio = this.videoDiapoLayout().imageRatio;
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
    const lesson = this._lessonService.lessonJson();
    const diapoType = this._lessonService.diapoType();

    if (lesson && diapoType) {
      this._diapoService.type.set(diapoType as any);
      this._diapoService.initVariables(lesson);
    }
  }

  changeLayout(ratio: Iratio) {
    this.videoDiapoLayout.update((layout) => ({
      ...layout,
      imageRatio: ratio,
    }));
  }

  changePosition(position: Iposition) {
    this.videoDiapoLayout.update((layout) => ({
      ...layout,
      imgPosition: position,
    }));
  }
}
