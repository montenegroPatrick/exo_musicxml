import { Component, inject, signal, computed, effect, OnDestroy, ChangeDetectionStrategy, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { L10N_LOCALE, L10nTranslatePipe } from 'angular-l10n';
import { MetronomeService } from 'src/core/services/utils/metronome.service';

@Component({
  selector: 'app-metronome-page',
  standalone: true,
  imports: [CommonModule, FormsModule, L10nTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './metronome-page.component.html',
  styleUrl: './metronome-page.component.scss'
})
export class MetronomePageComponent implements OnDestroy {
  readonly metronomeService = inject(MetronomeService);
  readonly locale = inject(L10N_LOCALE);
  
  // -- Tap Tempo State --
  private _lastTap = 0;
  private _tapTimes: number[] = [];

  // -- Timer State --
  readonly timerMinutes = signal<number>(1);
  readonly timerSeconds = signal<number>(0);
  readonly isTimerActive = signal<boolean>(false);
  private _timerInterval: any = null;

  // -- Tempo Classification (Logic Pro Style) --
  private readonly _tempoLabels = [
    { min: 10, max: 39, label: "Larghissimo" },
    { min: 40, max: 60, label: "Largo" },
    { min: 52, max: 68, label: "Lento" },
    { min: 60, max: 80, label: "Adagio" },
    { min: 76, max: 100, label: "Andante" },
    { min: 88, max: 112, label: "Moderato" },
    { min: 100, max: 128, label: "Allegretto" },
    { min: 112, max: 160, label: "Allegro" },
    { min: 138, max: 142, label: "Vivace" },
    { min: 140, max: 200, label: "Presto" },
    { min: 188, max: 320, label: "Prestissimo" }
  ];

  /** Reactive label for the current BPM range */
  readonly currentTempoLabel = computed(() => {
    const bpm = this.metronomeService.bpm();
    return this._tempoLabels.find(t => bpm >= t.min && bpm <= t.max)?.label || '';
  });

  /** Visual beats array for the measure progress bar */
  readonly beats = computed(() => Array(this.metronomeService.timeInMeasure()).fill(0));

  constructor() {
    // Automatically stop and reset the timer if the metronome is stopped manually
    effect(() => {
      if (!this.metronomeService.isPlaying() && this.isTimerActive()) {
        untracked(() => this.stopTimer());
      }
    });
  }

  // -- Control Actions --

  changeBpm(amount: number): void {
    this.metronomeService.setBpm(this.metronomeService.bpm() + amount);
  }

  onBpmInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.metronomeService.setBpm(Number(val));
  }

  changeSignature(amount: number): void {
    this.metronomeService.setSignature(this.metronomeService.timeInMeasure() + amount);
  }

  setDivision(s: number | 'shuffle'): void {
    if (s === 'shuffle') {
      this.metronomeService.setSubdivision(3);
      this.metronomeService.setShuffle(true);
    } else {
      this.metronomeService.setSubdivision(Number(s));
      this.metronomeService.setShuffle(false);
    }
  }

  // -- Tap Tempo Logic --

  tapTempo(): void {
    const now = Date.now();
    if (this._lastTap > 0) {
      const diff = now - this._lastTap;
      if (diff < 2000) { // Only count if taps are less than 2s apart
        this._tapTimes.push(diff);
        if (this._tapTimes.length > 5) this._tapTimes.shift();
        
        const avg = this._tapTimes.reduce((a, b) => a + b) / this._tapTimes.length;
        this.metronomeService.setBpm(Math.round(60000 / avg));
      } else {
        this._tapTimes = [];
      }
    }
    this._lastTap = now;
  }

  // -- Session Timer Logic --

  toggleTimer(): void {
    this.isTimerActive() ? this.stopTimer() : this.startTimer();
  }

  startTimer(): void {
    this.isTimerActive.set(true);
    let totalSeconds = this.timerMinutes() * 60 + this.timerSeconds();
    
    if (totalSeconds === 0) totalSeconds = 60; 

    this._timerInterval = setInterval(() => {
      if (totalSeconds <= 0) {
        this.stopTimer();
        this.metronomeService.stop();
        return;
      }
      totalSeconds--;
      this.timerMinutes.set(Math.floor(totalSeconds / 60));
      this.timerSeconds.set(totalSeconds % 60);
    }, 1000);
    
    if (!this.metronomeService.isPlaying()) {
      this.metronomeService.start();
    }
  }

  stopTimer(): void {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
    this.isTimerActive.set(false);
  }

  modifyTimer(seconds: number): void {
    const currentTotal = this.timerMinutes() * 60 + this.timerSeconds();
    const newTotal = Math.max(0, currentTotal + seconds);
    
    this.timerMinutes.set(Math.floor(newTotal / 60));
    this.timerSeconds.set(newTotal % 60);
    
    // Restart interval if active to sync with new time
    if (this.isTimerActive()) {
       this.stopTimer();
       this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
