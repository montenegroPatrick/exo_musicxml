import { Component, EventEmitter, Input, Output, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LessonNavigatorComponent } from '../../components/lesson-navigator/lesson-navigator.component';

@Component({
  selector: 'app-tap-rythm-vexflow-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, LessonNavigatorComponent],
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.scss'],
})
export class TapRythmVexflowBarComponent {
  @Input() title: string = '';
  @Input() subTitle: string = '';
  @Input() chapterTitle: string = '';
  @Input() subChapterTitle: string = '';
  @Input() chapter: number | string = '';
  @Input() subChapter: number | string = '';
  @Input() sequence: number | string = '';
  @Input() difficulty: number = 1;
  @Input() tempo: number = 60;
  @Input() isPlaying: boolean = false;
  @Input() metronomeVolume: number = 50;
  @Input() currentBeat: number = 0;
  @Input() beatsPerMeasure: number = 4;
  @Input() countdownMeasures: number = 1;
  @Input() exerciseProgress: number = 0; // 0 to 1 for global progress
  
  @Output() togglePlay = new EventEmitter<void>();
  @Output() difficultyChange = new EventEmitter<number>();
  @Output() tempoChange = new EventEmitter<number>();
  @Output() volumeChange = new EventEmitter<number>();
  @Output() countdownChange = new EventEmitter<number>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  
  isMobile = signal(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  showDifficultyPopin = signal(false);
  showSettingsPopin = signal(false);

  onVolumeChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.volumeChange.emit(parseInt(val, 10));
  }

  onTempoChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.tempoChange.emit(parseInt(val, 10));
  }

  onTempoAdjust(delta: number): void {
    const newVal = Math.min(Math.max(this.tempo + delta, 40), 240);
    this.tempoChange.emit(newVal);
  }

  onPlayClick(event: Event): void {
    event.stopPropagation();
    this.togglePlay.emit();
  }
}
