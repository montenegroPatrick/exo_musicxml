import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LessonService } from './services/lesson.service';
import { ControlBarComponent } from '../control-bar/control-bar.component';
import { ControlBarService } from '../control-bar/services/control-bar.service';
import { CoreDataService } from '@core/services/core-data.service';

@Component({
  selector: 'app-lesson-container',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ControlBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-screen w-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100 selection:bg-white/20">
      
      <!-- LOADING STATE -->
      @if (isLoading()) {
        <div class="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 transition-all duration-700">
          <div class="relative w-32 h-32 flex items-center justify-center">
            <!-- Animated Gradient Border -->
            <div class="absolute inset-0 rounded-full border border-white/5 animate-pulse"></div>
            <div class="absolute inset-2 rounded-full border border-white/10 [animation-delay:200ms] animate-pulse"></div>
            
            <!-- Spinning Core -->
            <div class="w-12 h-12 rounded-full border-t-2 border-r-2 border-white/80 animate-spin"></div>
            
            <!-- Glow Effect -->
            <div class="absolute w-40 h-40 bg-white/5 blur-3xl rounded-full"></div>
          </div>
          
          <div class="mt-8 text-center space-y-2">
            <h2 class="text-xl font-medium tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Chargement de la leçon
            </h2>
            <p class="text-xs text-white/40 font-mono tracking-widest uppercase animate-pulse">
              Initialisation du moteur...
            </p>
          </div>
        </div>
      } 
      
      <!-- ERROR STATE -->
      @else if (error()) {
        <div class="absolute inset-0 z-[100] flex items-center justify-center bg-zinc-950 px-6">
          <div class="max-w-md w-full p-8 rounded-3xl bg-white/5 border border-red-500/20 backdrop-blur-3xl text-center shadow-2xl">
            <div class="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">Erreur de chargement</h2>
            <p class="text-zinc-400 mb-8 leading-relaxed">{{ error()?.message || 'Une erreur inconnue est survenue.' }}</p>
            <button (click)="retry()" class="w-full py-3 px-6 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors">
              Réessayer
            </button>
          </div>
        </div>
      } 
      
      <!-- CONTENT -->
      @else {
        <div class="relative h-full w-full flex flex-col">
          <main class="flex-1 relative min-h-0">
            <router-outlet></router-outlet>
          </main>
          
          @if (showControlBar()) {
            <footer class="flex-shrink-0 z-40 w-full" style="background: var(--control-bar-bg)">
              <app-control-bar></app-control-bar>
            </footer>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      background: #09090b;
    }
    
    /* Smooth transition for router outlet */
    main {
      transition: opacity 0.5s ease-in-out;
    }
  `],
})
export class LessonContainerComponent implements OnInit {
  private readonly _router = inject(Router);
  private readonly _lessonService = inject(LessonService);
  private readonly _controlBarService = inject(ControlBarService);
  private readonly _coreData = inject(CoreDataService);

  // -- Reactive Mappings --
  readonly isLoading = this._lessonService.isLoading;
  readonly isSyncing = this._coreData.isSyncing;
  readonly syncMessage = this._coreData.syncMessage;
  readonly error = this._lessonService.error;
  readonly lessonJson = this._lessonService.lessonJson;
  readonly moduleType = this._lessonService.moduleType;
  
  /** Reactive decision helper for control bar visibility */
  readonly showControlBar = signal<boolean>(true);

  private readonly _hasNavigated = signal(false);

  constructor() {
    // Coordinate initial navigation when lesson data arrives
    effect(() => {
      const lesson = this.lessonJson();
      if (lesson && !this._hasNavigated()) {
        this._navigateToChildRoute();
      }
    });
  }

  ngOnInit(): void {
    // Prepare control bar for new lesson session
    this._controlBarService.reset();
  }

  retry(): void {
    window.location.reload();
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
