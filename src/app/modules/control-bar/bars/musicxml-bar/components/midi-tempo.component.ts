import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlatService } from '@core/services/flat.service';

@Component({
  selector: 'app-midi-tempo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './midi-tempo.component.html',
  styleUrl: './midi-tempo.component.scss'
})
export class MidiTempoComponent implements OnInit, OnDestroy {
  private _flatService = inject(FlatService);
  
  tempo = signal(120);
  currentBeat = this._flatService.currentBeat;
  timeInMeasure = this._flatService.timeInMeasure;
  
  private _interval: any;

  private _tempoInterval: any;

  ngOnInit() {
    // Initial sync
    this._flatService.getTempo().then(t => {
      if (t > 0) this.tempo.set(Math.round(t));
    });

    this._interval = setInterval(async () => {
      const t = await this._flatService.getTempo();
      if (t > 0 && t !== this.tempo()) {
        this.tempo.set(Math.round(t));
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this._interval) clearInterval(this._interval);
    this.stopAdjusting();
  }

  adjustTempo(delta: number) {
    if (this._flatService.isPlaying()) {
      this._flatService.pause();
    }
    const next = Math.max(20, Math.min(300, this.tempo() + delta));
    this.tempo.set(next);
    this._flatService.setTempo(next);
  }

  startAdjusting(delta: number) {
    this.adjustTempo(delta);
    this.stopAdjusting();
    this._tempoInterval = setInterval(() => {
      this.adjustTempo(delta);
    }, 100);
  }

  stopAdjusting() {
    if (this._tempoInterval) {
      clearInterval(this._tempoInterval);
      this._tempoInterval = null;
    }
  }

  onBpmInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const bpm = Number(val);
    if (!isNaN(bpm) && bpm >= 20 && bpm <= 320) {
      if (this._flatService.isPlaying()) {
        this._flatService.pause();
      }
      this.tempo.set(bpm);
      this._flatService.setTempo(bpm);
    }
  }

  // To helper with dots iteration
  getBeatsArray() {
    return Array(this.timeInMeasure()).fill(0);
  }
}
