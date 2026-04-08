import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LessonService } from '../lesson/services/lesson.service';
import { ControlBarComponent } from '../control-bar/control-bar.component';

@Component({
  selector: 'app-execution-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ControlBarComponent],
  template: `
    <div class="relative h-screen w-full flex flex-col bg-black text-white overflow-hidden font-sans">
      <!-- Top Header (Titles) -->
       @if (showControlBar()) {
        <header class="p-4 bg-black/60 backdrop-blur-md border-b border-white/10 z-10">
          <div class="flex flex-col gap-1">
            <h1 class="text-lg font-bold truncate">
              @if (chapter()) { <span class="text-primary-400">#{{chapter()}}</span> }
              {{chapterTitle()}}
            </h1>
            <div class="flex items-center gap-2 text-sm text-gray-400">
              <span class="truncate">{{subChapterTitle()}}</span>
              <span class="text-gray-600">|</span>
              <span class="truncate font-medium text-gray-300">{{sequenceTitle()}}</span>
            </div>
          </div>
        </header>
       }

      <!-- Main Content Area -->
      <main class="flex-grow relative overflow-hidden bg-zinc-900">
        <router-outlet></router-outlet>
        
        <!-- Loading Overlay -->
        @if (isLoading()) {
          <div class="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
            <div class="flex flex-col items-center gap-3">
              <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
              <span class="text-sm font-medium">Chargement...</span>
            </div>
          </div>
        }
      </main>

      <!-- Dynamic Control Bar -->
      @if (showControlBar()) {
        <app-control-bar 
          class="w-full relative z-10"
          [showNavigation]="showNavigation()">
        </app-control-bar>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }
  `]
})
export class ExecutionShellComponent {
  private _lessonService = inject(LessonService);
  private _route = inject(ActivatedRoute);

  isLoading = computed(() => this._lessonService.isLoading());
  
  // Metadata signals
  chapter = this._lessonService.chapter;
  chapterTitle = this._lessonService.chapterTitle;
  subChapterTitle = this._lessonService.subChapterTitle;
  sequenceTitle = this._lessonService.sequenceTitle;

  // Logic to determine if we show navigation buttons
  showNavigation = computed(() => {
    // Check route data or type of module
    const data = this._route.snapshot.data;
    return data['showNavigation'] !== false;
  });

  showControlBar = computed(() => {
    const data = this._route.snapshot.data;
    return data['hideControlBar'] !== true;
  });
}
