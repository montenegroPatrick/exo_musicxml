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
import { CommonModule, NgStyle } from '@angular/common';

export const defaultVideoDiapoLayout: IVideoDiapoLayout = {
  imageRatio: '1/2',
  imgPosition: 'top',
};

@Component({
  selector: 'app-video-diapo',
  standalone: true,
  imports: [CommonModule, NgStyle, VideoComponent, DiapoComponent, ButtonModule],
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
  readonly isVerticalMode = computed(() => {
    const mode = this.layoutMode();
    const isXml = this.typeImg() === 'xml';
    return isXml && (mode === 'track-top' || mode === 'track-bottom');
  });

  readonly videoStyles = computed(() => {
    const mode = this.layoutMode();
    const isXml = this.typeImg() === 'xml';
    const isHalf = mode === 'half';
    const isTrackTop = mode === 'track-top';
    const isTrackBottom = mode === 'track-bottom';
    const isExpanded = mode === 'expanded';

    // Ratios
    let width = '100%';
    let height = '100%';
    let order = this.sidebarPosition() === 'left' ? '2' : '1';

    if (isXml && (isTrackTop || isTrackBottom)) {
      // MODE VERTICAL 40/60
      height = '40%';
      order = isTrackBottom ? '2' : '1';
    } else {
      // MODE CÔTE À CÔTE
      if (isHalf) width = '50%';
      else if (isExpanded) width = '33.33%';
      else width = '66.66%';
      
      if (this.isMobile()) {
         width = '100%';
         height = 'auto';
      }
    }

    return {
      width: width,
      height: height,
      order: order,
      display: 'flex',
      'flex-shrink': '0',
      'min-width': isXml && (isHalf || isTrackTop || isTrackBottom) ? '100%' : '0'
    };
  });

  readonly scoreStyles = computed(() => {
    const mode = this.layoutMode();
    const isXml = this.typeImg() === 'xml';
    const isHalf = mode === 'half';
    const isTrackTop = mode === 'track-top';
    const isTrackBottom = mode === 'track-bottom';
    const isExpanded = mode === 'expanded';

    let width = '100%';
    let height = '100%';
    let order = this.sidebarPosition() === 'left' ? '1' : '2';

    if (isXml && (isHalf || isTrackTop || isTrackBottom)) {
      // MODE VERTICAL 40/60
      height = '60%';
      order = isTrackTop ? '2' : '1';
    } else {
      // MODE CÔTE À CÔTE
      if (isHalf) width = '50%';
      else if (isExpanded) width = '66.66%';
      else width = '33.33%';

      if (this.isMobile()) {
        width = '100%';
        height = 'auto';
      }
    }

    return {
      width: width,
      height: height,
      order: order,
      'flex-shrink': '0',
      'transition': 'all 0.3s ease',
      'min-width': (isXml && (isTrackTop || isTrackBottom)) ? '100%' : width
    };
  });

  // -- Layout Actions (Obsolètes, gérées par VideoBarComponent via le service global) --
}
