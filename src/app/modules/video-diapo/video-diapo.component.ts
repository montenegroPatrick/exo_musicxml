import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { VideoComponent } from '@core/shared/video/video.component';
import { DiapoComponent } from '@core/shared/diapo/diapo.component';
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
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';
import { ButtonModule } from 'primeng/button';
import { HostListener } from '@angular/core';

export const defaultVideoDiapoLayout: IVideoDiapoLayout = {
  imageRatio: '1/2',
  imgPosition: 'top',
};

@Component({
  selector: 'app-video-diapo',
  standalone: true,
  imports: [VideoComponent, DiapoComponent, ControlBarComponent, ButtonModule],
  templateUrl: './video-diapo.component.html',
})
export class VideoDiapoComponent implements OnInit {
  private _lessonService = inject(LessonService);
  private _jwpService = inject(JwpService);
  private _flatService = inject(FlatService);
  private _videoSyncService = inject(VideoSyncService);
  private _diapoService = inject(DiapoStateService);

  typeImg = computed(() => this._lessonService.diapoType() ?? 'eps');
  currentVideo = computed(() => this._lessonService.jwPlayerId());
  videoIsReady = computed(() => this._jwpService.isReady());
  
  videoDiapoLayout: WritableSignal<IVideoDiapoLayout> = signal<IVideoDiapoLayout>(
    defaultVideoDiapoLayout,
  );

  isMobile = signal<boolean>(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  ngOnInit(): void {
    // Ensure "Fit Content" is the default for a better first impression
    this._diapoService.viewMode.set('fit');
  }

  layoutMode = computed(() => this._diapoService.layoutMode());

  classImgContainer = computed(() => {
    // Standard layout: 1/3 diapo
    // Expanded layout: 2/3 diapo
    return this.layoutMode() === 'standard' ? 'col-span-1' : 'col-span-2';
  });

  classVideoContainer = computed(() => {
    // Standard layout: 2/3 video
    // Expanded layout: 1/3 video
    return this.layoutMode() === 'standard' ? 'col-span-2' : 'col-span-1';
  });

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
