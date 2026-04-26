import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VexflowRendererService } from '../../services/vexflow-renderer.service';
import { IMeasureInfo, ITapResult } from '../../interfaces/tap-rythm-vexflow.interface';

@Component({
  selector: 'app-vexflow-score',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vexflow-score.component.html',
  styleUrls: ['./vexflow-score.component.scss'],
})
export class VexflowScoreComponent implements OnChanges, AfterViewInit {
  @Input() measures: IMeasureInfo[] = [];
  @Input() measureWidth: number = 280;
  @Input() currentMeasureIndex: number = 0;
  @Input() feedbackResults: ITapResult[] = [];
  @Input() timeSignature: string = '4/4';
  @Input() progress: number = 0; // 0 to 1 representing total progress
  @Input() countdownProgress: number = 0; // 0 to 1 for the pre-roll beat
  @Input() totalDurationMs: number = 0;
  @Input() clefOffset: number = 50;
  @Input() tempo: number = 60;

  private _notePositions: { timeMs: number, x: number }[] = [];

  getCursorX(progress: number): number {
    if (!this.measures.length || !this.totalDurationMs) return 0;
    
    const timeMs = progress * this.totalDurationMs;
    const msPerBeat = 60000 / this.tempo;
    const beatsPerMeasure = parseInt(this.timeSignature.split('/')[0]) || 4;
    const msPerMeasure = msPerBeat * beatsPerMeasure;

    // Phase de décompte
    if (progress <= 0 && this.countdownProgress > 0) {
      // Glisse de 0 à la première note (clefOffset + 15)
      return this.countdownProgress * (this.clefOffset + 15);
    }

    const measureIndex = Math.floor(timeMs / msPerMeasure);
    const timeInMeasure = timeMs % msPerMeasure;
    
    // Formule calquée sur VexflowRendererService.renderAllMeasures :
    // X = clefOffset + (index * measureWidth) + 15 + (timeInMeasure / msPerMeasure) * (measureWidth - 30)
    
    const xBase = this.clefOffset + (measureIndex * this.measureWidth) + 15;
    const xRelative = (timeInMeasure / msPerMeasure) * (this.measureWidth - 30);
    
    return xBase + xRelative;
  }

  @ViewChild('vexCanvas') private _canvasRef!: ElementRef<HTMLDivElement>;
  @ViewChild('scoreContainer') private _container!: ElementRef<HTMLDivElement>;
  
  private readonly _rendererService = inject(VexflowRendererService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['measures'] || changes['measureWidth'] || changes['tempo']) {
      if (this.measures && this.measures.length > 0) {
        this._renderAll();
      }
    }
    
    if (changes['currentMeasureIndex']) {
      this._scrollToCurrent();
    }
  }

  ngAfterViewInit(): void {
    if (this.measures && this.measures.length > 0) {
      this._renderAll();
    }
  }

  private _renderAll(): void {
    if (!this._canvasRef || this.measures.length === 0) return;
    
    const el = this._canvasRef.nativeElement;
    this._notePositions = this._rendererService.renderAllMeasures(
      el,
      this.measures,
      this.measureWidth,
      this.tempo,
      [], // On ne passe plus les feedbacks ici (trop lourd)
      this.timeSignature,
      this.clefOffset
    );
  }

  private _scrollToCurrent(): void {
    if (!this._container || this.measures.length === 0) return;
    
    const containerWidth = this._container.nativeElement.clientWidth;
    const measureCenter = (this.currentMeasureIndex * this.measureWidth) + (this.measureWidth / 2);
    const scrollX = measureCenter - (containerWidth / 2);

    this._container.nativeElement.scrollTo({
      left: Math.max(0, scrollX),
      behavior: 'smooth'
    });
  }
}
