import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-midi-meter-placeholder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="meter-container">
      <div class="dummy-canvas"></div>
      <div class="db-scale">
        <span>0</span>
        <span>-6</span>
        <span>-12</span>
        <span>-18</span>
        <span>-24</span>
        <span>-36</span>
        <span>-48</span>
        <span>-60</span>
      </div>
    </div>
  `,
  styles: [`
    .meter-container {
      display: flex;
      height: 100%;
      gap: 4px;
      padding: 4px 0;
      background: #000;
      border: 1px solid #333;
      border-radius: 2px;
      position: relative;
    }
    .dummy-canvas {
      width: 12px;
      height: 100%;
      background: #111;
    }
    .db-scale {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 7px;
      color: #444;
      height: 100%;
      user-select: none;
      line-height: 1;
      padding: 2px 0;
    }
  `]
})
export class MidiMeterPlaceholderComponent {}
