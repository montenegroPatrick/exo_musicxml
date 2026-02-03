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
} from '@angular/core';
import { ControlBarService } from '../../services/control-bar.service';

@Component({
  selector: 'app-timeline-slider',
  imports: [],
  template: `
    @if (onHover()) {
      <span
        class=" absolute bottom-12 text-white left-0 text-xs w-fit mx-2  p-2 bg-black/75 backdrop-blur-3xl rounded-lg min-w-[40px] duration-500 transition-shadow "
        >{{ formatTime(currentTime()) }}</span
      >
      <span
        class=" absolute bottom-12 right-0 text-xs text-white w-fit mx-2  p-2 bg-black/75 backdrop-blur-3xl rounded-lg min-w-[40px] duration-500 transition-shadow "
        >{{ formatTime(duration()) }}</span
      >
    }
    <div
      #track
      class="h-1  cursor-pointer absolute w-full bottom-10 left-0 right-0"
      (mouseover)="onMouseHover($event)"
      (mouseleave)="onMouseLeave($event)"
      (mousedown)="onMouseDown($event)"
      (touchstart)="onTouchStart($event)"
    >
      <div class="timeline-progress" [style.width.%]="progress()"></div>
      <div class="timeline-thumb" [style.left.%]="progress()"></div>
    </div>
  `,
  styles: `
    .timeline-track {
      flex-grow: 1;
      height: 100%;
      background: transparent;
      border-radius: 3px;
      cursor: pointer;
    }

    .timeline-progress {
      height: 100%;
      background: #aec739;
      border-radius: 3px;
      pointer-events: none;
    }

    .timeline-thumb {
      width: 14px;
      height: 14px;
      background: white;
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
      pointer-events: none;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }
  `,
})
export class TimelineSliderComponent {
  private _controlBarService = inject(ControlBarService);
  private trackRef = viewChild<ElementRef<HTMLElement>>('track');
  private isDragging = signal(false);

  onHover = signal(false);

  duration = input<number>(0);
  seek = output<number>();

  currentTime = computed(() => this._controlBarService.time());
  progress = computed(() => {
    const dur = this.duration();
    if (!dur) return 0;
    return (this.currentTime() / dur) * 100;
  });

  constructor() {
    effect(() => {
      if (this.isDragging()) {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onTouchEnd);
      } else {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
      }
    });
  }

  onMouseHover(event: MouseEvent) {
    this.onHover.set(true);
  }

  onMouseLeave(event: MouseEvent) {
    setTimeout(() => {
      this.onHover.set(false);
    }, 6000);
  }

  onMouseDown(event: MouseEvent) {
    event.preventDefault();
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
    if (this.isDragging()) {
      this.updateFromEvent(event.clientX);
    }
  };

  private onMouseUp = () => {
    this.isDragging.set(false);
  };

  private onTouchMove = (event: TouchEvent) => {
    if (this.isDragging() && event.touches.length > 0) {
      this.updateFromEvent(event.touches[0].clientX);
    }
  };

  private onTouchEnd = () => {
    this.isDragging.set(false);
  };

  private updateFromEvent(clientX: number) {
    const track = this.trackRef()?.nativeElement;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(
      0,
      Math.min(100, (relativeX / rect.width) * 100),
    );
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
