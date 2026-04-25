import { Component, inject, computed, effect, ChangeDetectionStrategy, HostListener, signal } from '@angular/core';
import { RouterOutlet, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ControlBarType } from '@core/interfaces/lesson.interface';
import { LessonService } from '../lesson/services/lesson.service';
import { ControlBarComponent } from '../control-bar/control-bar.component';
import { ControlBarService } from '../control-bar/services/control-bar.service';
import { AudioMixerControlBarComponent } from '../audiomixer/components/audiomixer-control-bar/audiomixer-control-bar.component';
import { FlatService } from '@core/services/flat.service';
import { AudioService } from '@core/services/audio.service';
import { CoreDataService } from '@core/services/core-data.service';

@Component({
  selector: 'app-execution-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ControlBarComponent, AudioMixerControlBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './execution-shell.component.html',
})
export class ExecutionShellComponent {
  private readonly _coreData = inject(CoreDataService);
  private readonly _lessonService = inject(LessonService);
  private readonly _controlBarService = inject(ControlBarService);
  private readonly _flatService = inject(FlatService);
  private readonly _audioService = inject(AudioService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  readonly isMobile = signal<boolean>(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  // -- State Signals (Direct from CoreData) --
  readonly isLoading = this._lessonService.isLoading;
  readonly chapter = this._coreData.chapter;
  readonly chapterTitle = this._coreData.chapterTitle;
  readonly subChapterTitle = this._coreData.subChapterTitle;
  readonly sequenceTitle = this._coreData.sequenceTitle;

  /**
   * Reactive source for the deepest active route data.
   * Tracks navigation events and extracts specific configuration flags.
   */
  private readonly _navigationEnd = toSignal(
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null)
    )
  );

  /** Logic to determine if we show navigation buttons based on route data */

  /** Logic to determine the visibility of the control bar */
  readonly showControlBar = computed(() => {
    this._navigationEnd(); 
    const data = this._getDeepestRouteData();
    return data['hideControlBar'] !== true;
  });

  /** Logic to determine the type of control bar to render */
  readonly controlBarType = computed(() => {
    this._navigationEnd();
    const data = this._getDeepestRouteData();
    // Priorité à la route, sinon on prend la valeur du store (JSON)
    return (data['controlBar'] as ControlBarType) || this._coreData.controlBarType();
  });

  constructor() {
    // Synchronize control bar state whenever a new lesson is loaded
    effect(() => {
      const lesson = this._coreData.lessonJson();
      if (lesson) {
        this._controlBarService.reset();
        this._controlBarService.initFromLesson();
        
        // --- CRITICAL SYNC REGISTRATION ---
        console.log('%c[ExecutionShell] Registering FlatService for sync', 'background: #4A148C; color: #fff; padding: 2px 5px');
        this._audioService.registerListener(this._flatService);
      }
    });
  }

  /** Helper to traverse the route tree and find the deepest child's data */
  private _getDeepestRouteData(): any {
    let route = this._route.snapshot;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.data;
  }
}
