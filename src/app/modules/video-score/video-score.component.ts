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

@Component({
  selector: 'app-video-score',
  standalone: true,
  imports: [VideoComponent, XmlComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full bg-zinc-950 overflow-hidden">
      <div class="flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden custom-scrollbar">
        
        <!-- Video Section -->
        <div [class]="classVideoContainer()">
          <app-video 
            mode="fill"
            class="w-full h-full"
            typeImg="xml" 
            [mediaId]="currentVideo()!"
          ></app-video>
        </div>

        <!-- Score (Flat.io) Section -->
        <div [class]="classScoreContainer()">
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

  readonly classScoreContainer = computed(() => {
    // Position : sidebarPosition() ('left' ou 'right')
    // Ratio : layoutMode() ('standard' = 1/3, 'expanded' = 2/3)
    const ratio = this.layoutMode() === 'standard' ? 'md:w-1/3' : 'md:w-2/3';
    const order = this.sidebarPosition() === 'left' ? 'md:order-1' : 'md:order-2';
    
    return `w-full ${ratio} ${order} flex-shrink-0 min-w-[510px] h-full transition-all duration-300 relative bg-white`;
  });

  readonly classVideoContainer = computed(() => {
    // La vidéo prend l'espace restant
    const order = this.sidebarPosition() === 'left' ? 'md:order-2' : 'md:order-1';
    return `w-full md:flex-1 ${order} min-w-0 overflow-hidden bg-black flex items-center justify-center min-h-[30vh] md:min-h-0`;
  });
}
