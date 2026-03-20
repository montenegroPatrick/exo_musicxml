import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FlutterBridgeService } from '@core/services/flutter-bridge.service';
import { ControlBarComponent } from '../control-bar/control-bar.component';
import { ControlBarService } from '../control-bar/services/control-bar.service';
import { LessonService } from './services/lesson.service';

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
  private _flutterBridgeService = inject(FlutterBridgeService);
  isLoading = computed(() => this._lessonService.isLoading());
  error = computed(() => this._lessonService.error());
  lessonJson = computed(() => this._lessonService.lessonJson());
  moduleType = computed(() => this._lessonService.moduleType());
  controlBarType = computed(() => this._lessonService.controlBarType());

  showControlBar = computed(() => {
    const type = this.moduleType();

    return true;
  });

  private _hasNavigated = signal(false);

  constructor() {
    this._lessonService.initFlutterEventsListeners();
    effect(() => {
      const lesson = this.lessonJson();
      const hasNavigated = this._hasNavigated();

      if (lesson && !hasNavigated) {
        this._navigateToChildRoute();
      }
    });
  }

  ngOnInit(): void {
    this._controlBarService.reset();
  }

  private _navigateToChildRoute(): void {
    const targetRoute = this._lessonService.getTargetRoute();
    const lessonId = this._lessonService.lessonId();
    const seq = this._lessonService.seq();

    this._router.navigate(['/lesson', lessonId, seq, targetRoute]).then(() => {
      this._hasNavigated.set(true);
      this._controlBarService.initFromLesson();
    });
  }
}
