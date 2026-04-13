import { Component, input, viewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-audio-meter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="meter-container">
      <canvas #meterCanvas width="12" height="150"></canvas>
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
    canvas {
      width: 12px;
      height: 100%;
    }
    .db-scale {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 7px;
      color: #666;
      height: 100%;
      user-select: none;
      line-height: 1;
      padding: 2px 0;
    }
  `]
})
export class AudioMeterComponent implements AfterViewInit, OnDestroy {
  /** The analyser node to get frequency data from */
  analyser = input.required<AnalyserNode>();
  
  /** Canvas for rendering the meter */
  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('meterCanvas');
  
  private _animationId: number | null = null;
  private _dataArray!: Uint8Array;

  ngAfterViewInit() {
    const bufferLength = this.analyser().frequencyBinCount;
    this._dataArray = new Uint8Array(bufferLength);
    this.draw();
  }

  draw() {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const render = () => {
      this.analyser().getByteFrequencyData(this._dataArray as any);
      
      // Calculate average level
      let sum = 0;
      for (let i = 0; i < this._dataArray.length; i++) {
        sum += this._dataArray[i];
      }
      const average = sum / this._dataArray.length;
      const normalizedValue = average / 128; // Simple normalization for visualization

      ctx.clearRect(0, 0, width, height);

      // Gradient for professional look
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#166534'); // Dark green bottom
      gradient.addColorStop(0.6, '#22c55e'); // Bright green middle
      gradient.addColorStop(0.8, '#eab308'); // Yellow sub-peak
      gradient.addColorStop(0.95, '#ef4444'); // Red peak

      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, width, height);

      const barHeight = normalizedValue * height;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - barHeight, width, barHeight);

      // Logic Pro style segments
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      for (let i = 0; i < height; i += 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      this._animationId = requestAnimationFrame(render);
    };

    render();
  }

  ngOnDestroy() {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
    }
  }
}
