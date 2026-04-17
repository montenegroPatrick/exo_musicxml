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
import { XmlComponent } from '@core/shared/xml/xml.component';
import { JwpService } from '@core/services/jwp.service';
import { FlatService } from '@core/services/flat.service';
import { LessonService } from '../lesson/services/lesson.service';
import { VideoSyncService } from '../lesson/services/video-sync.service';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';
import { CommonModule, NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'app-video-score',
  standalone: true,
  imports: [CommonModule, NgClass, NgStyle, VideoComponent, XmlComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full bg-zinc-950 overflow-hidden">
      <div class="w-full h-full flex overflow-hidden" 
           [ngClass]="isVerticalMode() ? 'flex-col' : 'flex-col md:flex-row'">
        
        <!-- Video Section -->
        <div [ngStyle]="videoStyles()" class="bg-black flex items-center justify-center overflow-hidden">
          <app-video 
            mode="fill"
            class="w-full h-full"
            typeImg="xml" 
            [mediaId]="currentVideo()!"
          ></app-video>
        </div>

        <!-- Score (Flat.io) Section -->
        <div [ngStyle]="scoreStyles()" class="bg-white relative overflow-hidden shadow-2xl">
             @if (xmlContent()) {
                <app-xml [xml]="xmlContent()!"></app-xml>
             } @else {
                <div class="absolute inset-0 flex items-center justify-center text-zinc-400">
                    Chargement de la partition...
                </div>
             }
        </div>

      </div>
    </div>
  `,
  styles: ``,
})
export class VideoScoreComponent implements OnInit {
  private readonly _lessonService = inject(LessonService);
  private readonly _jwpService = inject(JwpService);
  private readonly _flatService = inject(FlatService);
  private readonly _videoSyncService = inject(VideoSyncService);
  private readonly _diapoService = inject(DiapoStateService);

  // -- Reactive Data --
  readonly layoutMode = this._diapoService.layoutMode;
  readonly sidebarPosition = this._diapoService.sidebarPosition;
  readonly currentVideo = this._lessonService.jwPlayerId;
  readonly xmlContent = this._lessonService.xmlContent; // Uses the reactive XML content from LessonService
  
  readonly isMobile = signal<boolean>(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  ngOnInit(): void {
    // Les réglages de layout sont désormais persistés via DiapoStateService
  }

  readonly isVerticalMode = computed(() => {
    const mode = this.layoutMode();
    return (mode === 'track-top' || mode === 'track-bottom');
  });

  readonly videoStyles = computed(() => {
    const mode = this.layoutMode();
    const isHalf = mode === 'half';
    const isTrackTop = mode === 'track-top';
    const isTrackBottom = mode === 'track-bottom';
    const isExpanded = mode === 'expanded';

    // Ratios par défaut (Standard : 1/3 Score, 2/3 Vidéo -> Vidéo = 66.66%)
    let width = '66.66%';
    let height = '100%';
    let order = this.sidebarPosition() === 'left' ? '2' : '1';

    if (isTrackTop || isTrackBottom) {
      // MODE VERTICAL 40/60
      height = '40%';
      width = '100%';
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
      'min-width': (isTrackTop || isTrackBottom) ? '100%' : '0'
    };
  });

  readonly scoreStyles = computed(() => {
    const mode = this.layoutMode();
    const isHalf = mode === 'half';
    const isTrackTop = mode === 'track-top';
    const isTrackBottom = mode === 'track-bottom';
    const isExpanded = mode === 'expanded';

    // Ratios par défaut (Standard : 1/3 Score -> 33.33%)
    let width = '33.33%';
    let height = '100%';
    let order = this.sidebarPosition() === 'left' ? '1' : '2';

    if (isTrackTop || isTrackBottom) {
      // MODE VERTICAL 40/60
      height = '60%';
      width = '100%';
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
      'min-width': (isTrackTop || isTrackBottom) ? '100%' : '0'
    };
  });
}
