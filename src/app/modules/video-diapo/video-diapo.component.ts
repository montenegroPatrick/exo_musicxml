import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  HostListener,
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

export const defaultVideoDiapoLayout: IVideoDiapoLayout = {
  imageRatio: '1/2',
  imgPosition: 'top',
};

@Component({
  selector: 'app-video-diapo',
  standalone: true,
  imports: [VideoComponent, DiapoComponent, ControlBarComponent, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-diapo.component.html',
})
export class VideoDiapoComponent implements OnInit {
  private readonly _lessonService = inject(LessonService);
  private readonly _jwpService = inject(JwpService);
  private readonly _flatService = inject(FlatService);
  private readonly _videoSyncService = inject(VideoSyncService);
  private readonly _diapoService = inject(DiapoStateService);

  // -- Reactive Data Sources --
  readonly typeImg = computed(() => this._lessonService.diapoType() ?? 'eps');
  readonly currentVideo = this._lessonService.jwPlayerId;
  readonly videoIsReady = this._jwpService.isReady;
  readonly layoutMode = this._diapoService.layoutMode;
  readonly sidebarPosition = this._diapoService.sidebarPosition;
  
  // -- Components State --
  readonly isMobile = signal<boolean>(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  ngOnInit(): void {
    // Ensure "Fit Content" is the default for a better first impression
    this._diapoService.setViewMode('fit');
  }

  // -- Dynamic Classes --
  readonly classImgContainer = computed(() => {
    // Ratio : layoutMode() ('standard' = 1/3, 'half' = 1/2, 'expanded' = 2/3)
    let ratio = 'md:w-1/3';
    if (this.layoutMode() === 'half') ratio = 'md:w-1/2';
    if (this.layoutMode() === 'expanded') ratio = 'md:w-2/3';

    const order = this.sidebarPosition() === 'left' ? 'md:order-1' : 'md:order-2';
    
    return `w-full ${ratio} ${order} flex-shrink-0 md:min-w-[400px] h-full transition-all duration-300 relative bg-white`;
  });

  readonly classVideoContainer = computed(() => {
    // La vidéo prend l'espace restant
    const order = this.sidebarPosition() === 'left' ? 'md:order-2' : 'md:order-1';
    return `w-full md:flex-1 ${order} min-w-0 overflow-hidden bg-black flex items-center justify-center min-h-[30vh] md:min-h-0`;
  });

  // -- Layout Actions (Obsolètes, gérées par VideoBarComponent via le service global) --
}
