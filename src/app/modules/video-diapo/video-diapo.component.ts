import {
  Component,
  computed,
  inject,
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
export class VideoDiapoComponent {
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

  // -- Dynamic Classes --

  readonly videoStyles = computed(() => {
    const mode = this.layoutMode();
    const isHalf = mode === 'half';
    const isExpanded = mode === 'expanded';
    const isMobile = this.isMobile();

    let width = isHalf ? '50%' : (isExpanded ? '33.33%' : '66.66%');
    let order = this.sidebarPosition() === 'left' ? '2' : '1';

    if (isMobile) {
      return {
        width: '100%',
        height: 'auto',
        order: '1',
        'flex-shrink': '0',
        'aspect-ratio': '16/9'
      };
    }

    return {
      width: width,
      height: '100%',
      order: order,
      display: 'flex',
      'flex-shrink': '1',
      'min-width': '0'
    };
  });

  readonly scoreStyles = computed(() => {
    const mode = this.layoutMode();
    const isHalf = mode === 'half';
    const isExpanded = mode === 'expanded';
    const isMobile = this.isMobile();

    let width = isHalf ? '50%' : (isExpanded ? '66.66%' : '33.33%');
    let order = this.sidebarPosition() === 'left' ? '1' : '2';

    if (isMobile) {
      return {
        width: '100%',
        height: 'auto',
        order: '2',
        'flex-shrink': '0',
        'background-color': '#FFF',
        'display': 'block',
        'overflow': 'visible',
        'min-height': '770px'
      };
    }

    // DESKTOP LOGIC
    const isOneThird = !isHalf && !isExpanded;
    let minWidth = isOneThird ? '470px' : '0px';

    return {
      width: width,
      height: '100%',
      order: order,
      padding: '0px',
      'flex-shrink': '0',
      'min-width': minWidth,
      'background-color': '#FFF',
      'display': 'block',
      'overflow': 'hidden'
    };
  });
}
