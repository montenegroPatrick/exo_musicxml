import { Component, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { L10N_LOCALE, L10nTranslatePipe } from 'angular-l10n';
import { MetronomeService } from './services/metronome.service';

@Component({
  selector: 'app-metronome-page',
  standalone: true,
  imports: [CommonModule, FormsModule, L10nTranslatePipe],
  templateUrl: './metronome-page.component.html',
  styleUrls: ['./metronome-page.component.scss']
})
export class MetronomePage implements OnDestroy {
  metronomeService = inject(MetronomeService);
  locale = inject(L10N_LOCALE);
  
  // Tap Tempo State
  private lastTap = 0;
  private tapTimes: number[] = [];

  // Timer State
  timerMinutes = signal(1);
  timerSeconds = signal(0);
  isTimerActive = signal(false);
  private timerInterval: any = null;

  // Tempo Labels (Legacy port)
  tempoLabels = [
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
    { min: 188, max: 300, label: "Prestissimo" }
  ];

  currentTempoLabel = computed(() => {
    const bpm = this.metronomeService.bpm();
    return this.tempoLabels.find(t => bpm >= t.min && bpm <= t.max)?.label || '';
  });

  beats = computed(() => Array(this.metronomeService.timeInMeasure()).fill(0));

  constructor() {
    // Stop timer if metronome stops manually
    effect(() => {
      if (!this.metronomeService.isPlaying() && this.isTimerActive()) {
        this.stopTimer();
      }
    });
  }

  // Control Methods
  increaseBpm(amount: number) {
    this.metronomeService.setBpm(this.metronomeService.bpm() + amount);
  }

  decreaseBpm(amount: number) {
    this.metronomeService.setBpm(this.metronomeService.bpm() - amount);
  }

  onBpmChange(event: any) {
    this.metronomeService.setBpm(Number((event.target as HTMLInputElement).value));
  }

  updateSignature(amount: number) {
    const newVal = Math.min(Math.max(this.metronomeService.timeInMeasure() + amount, 2), 12);
    this.metronomeService.setSignature(newVal);
  }

  setSub(s: number | string) {
    if (s === 'shuffle') {
      this.metronomeService.setSubdivision(3);
      this.metronomeService.isShuffle.set(true);
    } else {
      this.metronomeService.setSubdivision(Number(s));
      this.metronomeService.isShuffle.set(false);
    }
  }

  // Tap Tempo Logic
  tapTempo() {
    const now = Date.now();
    if (this.lastTap > 0) {
      const diff = now - this.lastTap;
      if (diff < 2000) { // Reset if gap > 2s
        this.tapTimes.push(diff);
        if (this.tapTimes.length > 4) this.tapTimes.shift();
        const avg = this.tapTimes.reduce((a, b) => a + b) / this.tapTimes.length;
        const bpm = Math.round(60000 / avg);
        this.metronomeService.setBpm(bpm);
      } else {
        this.tapTimes = [];
      }
    }
    this.lastTap = now;
  }

  // Timer Methods
  toggleTimer() {
    if (this.isTimerActive()) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  private startTimer() {
    this.isTimerActive.set(true);
    let totalSeconds = this.timerMinutes() * 60 + this.timerSeconds();
    
    if (totalSeconds === 0) totalSeconds = 60; // Default 1m

    this.timerInterval = setInterval(() => {
      if (totalSeconds <= 0) {
        this.stopTimer();
        this.metronomeService.stop();
        return;
      }
      totalSeconds--;
      this.timerMinutes.set(Math.floor(totalSeconds / 60));
      this.timerSeconds.set(totalSeconds % 60);
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerActive.set(false);
  }

  addTime(seconds: number) {
    const current = this.timerMinutes() * 60 + this.timerSeconds();
    const next = Math.max(0, current + seconds);
    this.timerMinutes.set(Math.floor(next / 60));
    this.timerSeconds.set(next % 60);
    if (this.isTimerActive()) {
       this.stopTimer();
       this.startTimer();
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}
