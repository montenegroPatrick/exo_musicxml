import { Component, inject, computed, effect, signal } from '@angular/core';
import { RouterOutlet, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { LessonService } from '../lesson/services/lesson.service';
import { ControlBarComponent } from '../control-bar/control-bar.component';
import { ControlBarService } from '../control-bar/services/control-bar.service';

@Component({
  selector: 'app-execution-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ControlBarComponent],
  templateUrl: './execution-shell.component.html',
  styleUrls: ['./execution-shell.component.scss']
})
export class ExecutionShellComponent {
  private _lessonService = inject(LessonService);
  private _controlBarService = inject(ControlBarService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);

  isLoading = computed(() => this._lessonService.isLoading());
  
  // Metadata signals
  chapter = this._lessonService.chapter;
  chapterTitle = this._lessonService.chapterTitle;
  subChapterTitle = this._lessonService.subChapterTitle;
  sequenceTitle = this._lessonService.sequenceTitle;

  // Track the current active route reactively
  private _navigationEnd = toSignal(
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null)
    )
  );

  // Logic to determine if we show navigation buttons
  showNavigation = computed(() => {
    this._navigationEnd(); // Trigger reactivity on navigation
    let route = this._route.snapshot;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.data['showNavigation'] !== false;
  });

  showControlBar = computed(() => {
    this._navigationEnd(); // Trigger reactivity on navigation
    let route = this._route.snapshot;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.data['hideControlBar'] !== true;
  });

  constructor() {
    // Re-initialize control bar whenever lesson data changes
    effect(() => {
      if (this._lessonService.lessonJson()) {
        console.log('[ExecutionShell]: Lesson loaded, initializing control bar...');
        this._controlBarService.reset();
        this._controlBarService.initFromLesson();
      }
    });
  }
}
