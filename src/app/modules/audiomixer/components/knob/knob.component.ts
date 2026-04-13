import { Component, model, computed, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-knob',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="knob-wrapper" (mousedown)="onMouseDown($event)">
      <div 
        class="knob-dial" 
        [style.transform]="rotateStyle()"
      >
        <div class="knob-indicator"></div>
      </div>
      <span class="knob-value">{{ displayValue() }}</span>
    </div>
  `,
  styles: [`
    .knob-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: ns-resize;
      user-select: none;
    }
    .knob-dial {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #444 0%, #222 100%);
      border: 2px solid #1a1a1a;
      box-shadow: 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
      position: relative;
      transition: transform 0.1s ease-out;
    }
    .knob-indicator {
      position: absolute;
      top: 4px;
      left: 50%;
      width: 2px;
      height: 8px;
      background: #e4e4e7;
      transform: translateX(-50%);
      border-radius: 1px;
      box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
    }
    .knob-value {
      font-size: 8px;
      color: #888;
      font-weight: bold;
      font-family: monospace;
    }
  `]
})
export class KnobComponent {
  /** Two-way signal for the knob value (-1.0 to 1.0) */
  value = model<number>(0);
  
  private _isDragging = false;
  private _startY = 0;
  private _startValue = 0;

  /** Computed rotation style based on current signal value */
  rotateStyle = computed(() => {
    const angle = this.value() * 135;
    return `rotate(${angle}deg)`;
  });

  /** Computed string representation of the value (e.g. L50, C, R50) */
  displayValue = computed(() => {
    const val = this.value();
    if (val === 0) return 'C';
    const side = val < 0 ? 'L' : 'R';
    const percent = Math.abs(Math.round(val * 100));
    return `${side}${percent}`;
  });

  onMouseDown(event: MouseEvent) {
    this._isDragging = true;
    this._startY = event.clientY;
    this._startValue = this.value();
    event.preventDefault();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this._isDragging) return;

    const deltaY = this._startY - event.clientY;
    const sensitivity = 0.005;
    let newValue = this._startValue + deltaY * sensitivity;
    
    // Clamp
    newValue = Math.max(-1, Math.min(1, newValue));
    
    // Snap to center
    if (Math.abs(newValue) < 0.05) newValue = 0;

    this.value.set(newValue);
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this._isDragging = false;
  }
}
