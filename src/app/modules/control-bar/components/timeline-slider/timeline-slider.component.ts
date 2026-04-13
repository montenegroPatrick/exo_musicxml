import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import { ControlBarService } from '../../services/control-bar.service';

@Component({
  selector: 'app-timeline-slider',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (onHover()) {
      <div class="time-tooltip absolute bottom-12 left-0 right-0 flex justify-between px-2 pointer-events-none">
        <span class="text-white text-[10px] font-bold py-1 px-2 bg-black/80 backdrop-blur-md rounded border border-white/10 shadow-xl">
          {{ formatTime(currentTime()) }}
        </span>
        <span class="text-white text-[10px] font-bold py-1 px-2 bg-black/80 backdrop-blur-md rounded border border-white/10 shadow-xl">
          {{ formatTime(duration()) }}
        </span>
      </div>
    }
    
    <div
      #track
      class="timeline-hitbox cursor-pointer absolute w-full bottom-10 left-0 right-0 h-4 flex items-center"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (mousedown)="onMouseDown($event)"
      (touchstart)="onTouchStart($event)"
    >
      <div class="timeline-track-bg w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
        <div class="timeline-progress absolute h-full bg-[#aec739] shadow-[0_0_8px_rgba(174,199,57,0.4)]" [style.width.%]="progress()"></div>
      </div>
      <div class="timeline-thumb absolute w-3 h-3 bg-white rounded-full shadow-lg border border-zinc-500 transition-transform" 
           [style.left.%]="progress()"
           [class.scale-150]="isDragging() || onHover()">
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .timeline-hitbox:hover .timeline-track-bg {
      height: 6px;
      transition: height 0.1s ease;
    }
    .timeline-thumb {
      transform: translate(-50%, 0);
      pointer-events: none;
      z-index: 10;
    }
  `],
})
export class TimelineSliderComponent implements OnDestroy {
  private _controlBarService = inject(ControlBarService);
  private trackRef = viewChild.required<ElementRef<HTMLElement>>('track');
  
  isDragging = signal(false);
  onHover = signal(false);

  duration = input.required<number>();
  seek = output<number>();

  currentTime = this._controlBarService.time;
  progress = computed(() => {
    const dur = this.duration();
    if (!dur) return 0;
    return (this.currentTime() / dur) * 100;
  });

  constructor() {
    // Manage document-level event listeners reactively
    effect(() => {
      if (this.isDragging()) {
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('touchmove', this.onTouchMove);
        window.addEventListener('touchend', this.onTouchEnd);
      } else {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('touchend', this.onTouchEnd);
      }
    });
  }

  ngOnDestroy(): void {
    // Ensure cleanup
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
  }

  onMouseEnter() {
    this.onHover.set(true);
  }

  onMouseLeave() {
    this.onHover.set(false);
  }

  onMouseDown(event: MouseEvent) {
    if (event.button !== 0) return; // Left click only
    this.isDragging.set(true);
    this.updateFromEvent(event.clientX);
  }

  onTouchStart(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.isDragging.set(true);
      this.updateFromEvent(event.touches[0].clientX);
    }
  }

  private onMouseMove = (event: MouseEvent) => {
    this.updateFromEvent(event.clientX);
  };

  private onMouseUp = () => {
    this.isDragging.set(false);
  };

  private onTouchMove = (event: TouchEvent) => {
    if (event.touches.length > 0) {
      this.updateFromEvent(event.touches[0].clientX);
    }
  };

  private onTouchEnd = () => {
    this.isDragging.set(false);
  };

  private updateFromEvent(clientX: number) {
    const track = this.trackRef().nativeElement;
    const rect = track.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    const time = (percentage / 100) * this.duration();

    this.seek.emit(time);
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
