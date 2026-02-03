import {
  Component,
  input,
  output,
  signal,
  computed,
  ElementRef,
  viewChild,
  effect,
} from '@angular/core';

@Component({
  selector: 'app-fader',
  imports: [],
  template: `
    <div class="fader-container">
      <!-- dB markers -->
      <div class="fader-markers">
        <span class="marker">+6</span>
        <span class="marker">0</span>
        <span class="marker">-6</span>
        <span class="marker">-12</span>
        <span class="marker">-24</span>
        <span class="marker">-∞</span>
      </div>

      <!-- Fader track -->
      <div
        #track
        class="fader-track"
        (mousedown)="onTrackClick($event)"
        (touchstart)="onTouchStart($event)"
      >
        <!-- LED meter background -->
        <div class="fader-meter-bg"></div>

        <!-- LED meter fill -->
        <div class="fader-meter" [style.height.%]="value()"></div>

        <!-- Track groove -->
        <div class="fader-groove"></div>

        <!-- Fader cap/knob -->
        <div
          #knob
          class="fader-knob"
          [style.bottom.%]="value()"
          (mousedown)="onKnobMouseDown($event)"
          (touchstart)="onKnobTouchStart($event)"
        >
          <div class="knob-grip"></div>
          <div class="knob-grip"></div>
          <div class="knob-grip"></div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .fader-container {
      display: flex;
      align-items: stretch;
      height: 140px;
      user-select: none;
    }

    .fader-markers {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 8px 0;
      margin-right: 6px;
    }

    .marker {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.5);
      text-align: right;
      line-height: 1;
    }

    .fader-track {
      position: relative;
      width: 32px;
      height: 100%;
      background: linear-gradient(
        to right,
        #1a1a1a 0%,
        #2a2a2a 20%,
        #2a2a2a 80%,
        #1a1a1a 100%
      );
      border-radius: 4px;
      box-shadow:
        inset 0 2px 4px rgba(0, 0, 0, 0.5),
        0 1px 0 rgba(255, 255, 255, 0.05);
      cursor: pointer;
    }

    .fader-meter-bg {
      position: absolute;
      left: 4px;
      right: 4px;
      top: 8px;
      bottom: 8px;
      background: linear-gradient(
        to top,
        #1a472a 0%,
        #1a472a 60%,
        #4a4a1a 60%,
        #4a4a1a 80%,
        #4a1a1a 80%,
        #4a1a1a 100%
      );
      border-radius: 2px;
      opacity: 0.3;
    }

    .fader-meter {
      position: absolute;
      left: 4px;
      right: 4px;
      bottom: 8px;
      background: linear-gradient(
        to top,
        #00ff44 0%,
        #00ff44 60%,
        #ffff00 60%,
        #ffff00 80%,
        #ff4444 80%,
        #ff4444 100%
      );
      border-radius: 2px;
      transition: height 0.05s ease-out;
      max-height: calc(100% - 16px);
    }

    .fader-groove {
      position: absolute;
      left: 50%;
      top: 8px;
      bottom: 8px;
      width: 4px;
      transform: translateX(-50%);
      background: linear-gradient(
        to right,
        #0a0a0a 0%,
        #1a1a1a 50%,
        #0a0a0a 100%
      );
      border-radius: 2px;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8);
    }

    .fader-knob {
      position: absolute;
      left: 50%;
      transform: translate(-50%, 50%);
      width: 36px;
      height: 24px;
      background: linear-gradient(
        to bottom,
        #666 0%,
        #4a4a4a 10%,
        #3a3a3a 50%,
        #2a2a2a 90%,
        #1a1a1a 100%
      );
      border-radius: 3px;
      cursor: grab;
      box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.5),
        0 -1px 0 rgba(255, 255, 255, 0.1) inset,
        0 1px 0 rgba(0, 0, 0, 0.3) inset;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 2px;
      transition: box-shadow 0.1s ease;
    }

    .fader-knob:hover {
      box-shadow:
        0 2px 6px rgba(0, 0, 0, 0.6),
        0 -1px 0 rgba(255, 255, 255, 0.15) inset,
        0 1px 0 rgba(0, 0, 0, 0.3) inset;
    }

    .fader-knob:active {
      cursor: grabbing;
    }

    .knob-grip {
      width: 20px;
      height: 2px;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(0, 0, 0, 0.2) 100%
      );
      border-radius: 1px;
    }
  `,
})
export class FaderComponent {
  value = input<number>(100);
  valueChange = output<number>();

  private trackRef = viewChild<ElementRef<HTMLElement>>('track');
  private isDragging = signal(false);

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

  onKnobMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onKnobTouchStart(event: TouchEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onTrackClick(event: MouseEvent) {
    this.updateValueFromEvent(event.clientY);
  }

  onTouchStart(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.updateValueFromEvent(event.touches[0].clientY);
      this.isDragging.set(true);
    }
  }

  private onMouseMove = (event: MouseEvent) => {
    if (this.isDragging()) {
      this.updateValueFromEvent(event.clientY);
    }
  };

  private onMouseUp = () => {
    this.isDragging.set(false);
  };

  private onTouchMove = (event: TouchEvent) => {
    if (this.isDragging() && event.touches.length > 0) {
      this.updateValueFromEvent(event.touches[0].clientY);
    }
  };

  private onTouchEnd = () => {
    this.isDragging.set(false);
  };

  private updateValueFromEvent(clientY: number) {
    const track = this.trackRef()?.nativeElement;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const percentage = 100 - (relativeY / rect.height) * 100;
    const clampedValue = Math.max(0, Math.min(100, percentage));

    this.valueChange.emit(Math.round(clampedValue));
  }
}
