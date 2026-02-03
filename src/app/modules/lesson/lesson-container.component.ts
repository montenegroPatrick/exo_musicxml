import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LessonService } from './services/lesson.service';
import { ControlBarComponent } from '../control-bar/control-bar.component';
import { ControlBarService } from '../control-bar/services/control-bar.service';

@Component({
  selector: 'app-lesson-container',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ControlBarComponent],
  template: `
    <div class="relative h-full w-full">
      @if (isLoading()) {
        <div
          class="flex items-center justify-center h-full w-full bg-black text-white"
        >
          <div class="text-center">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"
            ></div>
            <p>Loading lesson...</p>
          </div>
        </div>
      } @else if (error()) {
        <div
          class="flex items-center justify-center h-full w-full bg-black text-red-500"
        >
          <div class="text-center">
            <p class="text-xl mb-2">Error loading lesson</p>
            <p class="text-sm">{{ error()?.message }}</p>
          </div>
        </div>
      } @else {
        <router-outlet></router-outlet>
        @if (showControlBar()) {
          <app-control-bar></app-control-bar>
        }
      }
    </div>
  `,
})
export class LessonContainerComponent implements OnInit {
  private _router = inject(Router);
  private _lessonService = inject(LessonService);
  private _controlBarService = inject(ControlBarService);

  isLoading = computed(() => this._lessonService.isLoading());
  error = computed(() => this._lessonService.error());
  lessonJson = computed(() => this._lessonService.lessonJson());
  moduleType = computed(() => this._lessonService.moduleType());
  controlBarType = computed(() => this._lessonService.controlBarType());

  // Show control bar for video, video-img, and img with xml
  showControlBar = computed(() => {
    const type = this.moduleType();
    // video-img has control bar in its own component

    // Show for video and img
    return true;
  });

  private _hasNavigated = signal(false);

  constructor() {
    // Effect to navigate to child route when lesson is loaded
    effect(() => {
      const lesson = this.lessonJson();
      const hasNavigated = this._hasNavigated();

      if (lesson && !hasNavigated) {
        this._navigateToChildRoute();
      }
    });
  }

  ngOnInit(): void {
    // Reset control bar service for new lesson
    this._controlBarService.reset();
  }

  private _navigateToChildRoute(): void {
    const targetRoute = this._lessonService.getTargetRoute();
    const lessonId = this._lessonService.lessonId();
    const seq = this._lessonService.seq();

    console.log(
      '[LessonContainerComponent]:_navigateToChildRoute =>',
      targetRoute,
    );

    // Navigate to the child route
    this._router.navigate(['/lesson', lessonId, seq, targetRoute]).then(() => {
      this._hasNavigated.set(true);
      // Initialize control bar after navigation
      this._controlBarService.initFromLesson();
    });
  }
}
