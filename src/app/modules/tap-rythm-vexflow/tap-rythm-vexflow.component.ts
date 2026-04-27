import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  computed,
  HostListener,
  effect,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TapRythmVexflowService } from './services/tap-rythm-vexflow.service';
import { MetronomeService } from '../../../core/services/utils/metronome.service';
import { VexflowScoreComponent } from './components/vexflow-score/vexflow-score.component';
import { TapRythmVexflowBarComponent } from '../control-bar/bars/tap-rythm-vexflow-bar/control-bar.component';
import { IMeasureInfo, IRhythmNote, ITapResult, ExerciseStatus, ITapRythmVexflowData } from './interfaces/tap-rythm-vexflow.interface';
import { VexflowRendererService } from './services/vexflow-renderer.service';
import { SoundService } from 'src/core/services/utils/sound-service.service';
import { PostMessageService } from '../tap-rythm/services/post-message.service';

@Component({
  selector: 'app-tap-rythm-vexflow-page',
  standalone: true,
  imports: [CommonModule, VexflowScoreComponent, TapRythmVexflowBarComponent],
  templateUrl: './tap-rythm-vexflow.component.html',
  styleUrls: ['./tap-rythm-vexflow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TapRythmVexflowPageComponent implements OnInit, OnDestroy {
  private readonly _route = inject(ActivatedRoute);
  private readonly _http = inject(HttpClient);
  private readonly _dataService = inject(TapRythmVexflowService);
  private readonly _rendererService = inject(VexflowRendererService);
  private readonly _soundService = inject(SoundService);
  private readonly _postMessageService = inject(PostMessageService);
  private readonly _cdr = inject(ChangeDetectorRef);
  readonly metronome = inject(MetronomeService);

  // -- Signals --
  readonly data = signal<ITapRythmVexflowData | null>(null);
  readonly exerciseStatus = signal<ExerciseStatus>('not-started');
  readonly difficultyLevel = signal<number>(1);
  readonly metronomeVolume = signal<number>(70);
  readonly countdownMeasures = signal<number>(1);
  readonly currentMeasureIndex = signal<number>(0);
  readonly exerciseProgress = signal<number>(0);
  readonly lastFeedback = signal<string | null>(null);
  readonly countdownValue = signal<number>(0);
  readonly countdownMeasureIndex = signal<number>(1);
  readonly countdownProgress = signal<number>(0);
  readonly notePadding = signal(15);
  readonly clefOffset = signal(85);
  readonly isTapping = signal<boolean>(false);
  readonly totalDurationMs = signal<number>(0);
  readonly tappedResults = signal<ITapResult[]>([]);
  readonly results = signal({ perfect: 0, good: 0, bad: 0, missed: 0 });

  // -- Computed --
  readonly measureWidth = computed(() => parseInt(this.data()?.mesureSize || '320', 10));
  
  readonly processedMeasures = computed(() => {
    const data = this.data();
    if (!data) return [];
    
    const rawMeasures = data.mesureList || [];
    const tempo = this.metronome.bpm();
    const msPerBeat = 60000 / tempo;
    const beatsPerMeasure = this.metronome.timeInMeasure();
    
    let cumulativeTimeMs = 0;

    return rawMeasures.map((mStr: string, mIdx: number) => {
      const notes = this._rendererService.getNotesFromMeasure(mStr, tempo);
      notes.forEach(n => {
        n.timeMs = cumulativeTimeMs;
        
        // Calcul de la durée pour la note suivante
        const durationMap: Record<string, number> = { 
          'w': 4, 'wd': 6, 'h': 2, 'hd': 3, 'q': 1, 'qd': 1.5, '8': 0.5, '8d': 0.75, '16': 0.25, '16d': 0.375,
          'wr': 4, 'hr': 2, 'qr': 1, '8r': 0.5, '16r': 0.25
        };
        cumulativeTimeMs += (durationMap[n.duration] || 1) * msPerBeat;
      });
      return { index: mIdx, notes };
    });
  });

  readonly score = computed(() => {
    const r = this.results();
    const total = r.perfect + r.good + r.bad + r.missed;
    if (total === 0) return 0;
    return Math.round(((r.perfect + r.good * 0.7) / total) * 100);
  });

  // -- Internal State --
  private _exerciseStartTime: number = 0;
  private _totalDurationMs: number = 0;
  private _animationFrameId: number | null = null;
  private _expectedTaps: { timeMs: number, measureIndex: number, noteIndex: number }[] = [];

  constructor() {
    // Effect to handle real-time progress tracking
    effect(() => {
      if (this.exerciseStatus() === 'playing') {
        this._startProgressTracking();
      } else {
        this._stopProgressTracking();
      }
    });
  }

  ngOnInit(): void {
    const mock = this._route.snapshot.queryParamMap.get('mock') || 'tapRythmVexFlowNav';
    this._http.get<ITapRythmVexflowData>(`assets/test-data/${mock}.json?t=${Date.now()}`).subscribe(data => {
      if (data) {
        this.data.set(data);
        this.tappedResults.set([]);
        this.metronome.setBpm(parseInt(data.tempo || '60', 10));
        
        const div = data.mesureDivision || '44';
        this.metronome.setSignature(parseInt(div.charAt(0), 10) || 4);
        this.metronome.setTimeBeatType(parseInt(div.charAt(1), 10) || 4);
        
        this._prepareExpectedTaps();
      }
    });
  }

  private _prepareExpectedTaps(): void {
    const measures = this.processedMeasures();
    
    this._expectedTaps = [];
    measures.forEach((m: IMeasureInfo, mIdx: number) => {
      m.notes.forEach((n: IRhythmNote, nIdx: number) => {
        if (n.expectTap) {
          this._expectedTaps.push({
            timeMs: n.timeMs,
            measureIndex: mIdx,
            noteIndex: nIdx
          });
        }
      });
    });

    const tempo = this.metronome.bpm();
    const msPerBeat = 60000 / tempo;
    const beatsPerMeasure = this.metronome.timeInMeasure();
    const totalDuration = measures.length * beatsPerMeasure * msPerBeat;
    this._totalDurationMs = totalDuration;
    this.totalDurationMs.set(totalDuration);
  }

  handleTogglePlay(): void {
    if (this.exerciseStatus() === 'not-started' || this.exerciseStatus() === 'finish') {
      this.startExercise();
    } else {
      this.stopExercise();
    }
  }

  startExercise(): void {
    // Reset tout avant de commencer
    this.resetStats();
    this.tappedResults.set([]);
    this.exerciseProgress.set(0);
    this.countdownProgress.set(0);
    this.lastFeedback.set(null);
    this.currentMeasureIndex.set(0);

    this.exerciseStatus.set('countdown');
    this.metronome.start();
    
    let measuresCounted = 0;
    let lastBeat = -1;

    const countdownTimer = setInterval(() => {
      if (this.exerciseStatus() !== 'countdown') {
        clearInterval(countdownTimer);
        return;
      }

      const currentBeat = this.metronome.currentBeat();
      if (currentBeat !== lastBeat) {
        lastBeat = currentBeat;
        
        // Update visual countdown (1, 2, 3, 4...)
        this.countdownValue.set(currentBeat + 1);
        
        // Pré-roll visuel : Si on est sur le dernier beat de la dernière mesure de décompte
        const isLastMeasure = measuresCounted === this.countdownMeasures();
        const isLastBeat = (currentBeat + 1) === this.metronome.timeInMeasure();
        
        if (isLastMeasure && isLastBeat && this.countdownProgress() === 0) {
          const bpm = this.metronome.bpm();
          const beatDuration = 60000 / (bpm > 0 ? bpm : 60);
          const startPreRoll = performance.now();
          
          const animatePreRoll = () => {
            if (this.exerciseStatus() !== 'countdown') {
              this.countdownProgress.set(0);
              return;
            }
            const elapsed = performance.now() - startPreRoll;
            const prog = Math.min(1, elapsed / beatDuration);
            this.countdownProgress.set(prog);
            if (prog < 1) requestAnimationFrame(animatePreRoll);
          };
          requestAnimationFrame(animatePreRoll);
        }
        
        if (currentBeat === 0) {
          measuresCounted++;
          
          if (measuresCounted > this.countdownMeasures()) {
            clearInterval(countdownTimer);
            // On démarre précisément sur le premier temps de la mesure d'exercice
            this._startRunning();
            return;
          }
          this.countdownMeasureIndex.set(measuresCounted);
        }
      }
    }, 10); // Plus fréquent pour plus de précision
  }

  private _startRunning(): void {
    this.exerciseStatus.set('playing');
    // On utilise le temps audio précis capturé par le métronome
    this._exerciseStartTime = this.metronome.exerciseStartAudioTime() || (this.metronome.audioContext?.currentTime || 0);
    this._prepareExpectedTaps(); // Refresh to be sure
  }

  private _startProgressTracking(): void {
    const msPerBeat = 60000 / this.metronome.bpm();
    const beatsPerMeasure = this.metronome.timeInMeasure();
    const msPerMeasure = msPerBeat * beatsPerMeasure;

    const update = () => {
      if (this.exerciseStatus() !== 'playing') return;
      
      const now = this.metronome.audioContext?.currentTime || 0;
      const elapsed = (now - this._exerciseStartTime) * 1000; // Conversion en ms
      
      // On s'assure que la durée totale est cohérente avec le BPM actuel
      const totalDuration = this.processedMeasures().length * msPerMeasure;
      const progress = Math.min(1, elapsed / totalDuration);
      
      this.exerciseProgress.set(progress);

      const currentMeasure = Math.floor(elapsed / msPerMeasure);
      if (currentMeasure !== this.currentMeasureIndex()) {
        this.currentMeasureIndex.set(Math.min(currentMeasure, this.processedMeasures().length - 1));
      }

      if (progress >= 1) {
        this.finishExercise();
      } else {
        this._animationFrameId = requestAnimationFrame(update);
      }
    };
    this._animationFrameId = requestAnimationFrame(update);
  }

  private _stopProgressTracking(): void {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  stopExercise(): void {
    this.metronome.stop();
    this.exerciseStatus.set('not-started');
    this.exerciseProgress.set(0);
    this.currentMeasureIndex.set(0);
    this._stopProgressTracking();
  }

  finishExercise(): void {
    this.exerciseStatus.set('finish');
    this.metronome.stop();
    this._stopProgressTracking();
    
    // Calculer les notes manquées
    const tappedTimes = this.tappedResults().map(r => r.expectedTimeMs);
    const missedCount = this._expectedTaps.filter(exp => !tappedTimes.includes(exp.timeMs)).length;
    
    if (missedCount > 0) {
      this.results.update(r => ({ ...r, missed: missedCount }));
    }
  }

  resetExercise(): void {
    this.stopExercise();
    this.resetStats();
  }

  handleContinue(): void {
    this._postMessageService.emitSequenceChange();
  }

  resetStats(): void {
    this.results.set({ perfect: 0, good: 0, bad: 0, missed: 0 });
    this.lastFeedback.set(null);
    this.tappedResults.set([]);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.preventDefault();
      this.handleTap(event);
    }
  }

  handleTap(event: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (this.exerciseStatus() !== 'playing') return;
    
    // Visual flash feedback
    this.isTapping.set(true);
    setTimeout(() => this.isTapping.set(false), 80);

    const now = this.metronome.audioContext?.currentTime || 0;
    const tapTime = (now - this._exerciseStartTime) * 1000; // En ms
    this._soundService.playTapSound();
    this._evaluateTap(tapTime);
  }

  private _evaluateTap(tapTime: number): void {
    let bestDiff = Infinity;
    let bestIdx = -1;

    // Récupérer les temps déjà validés pour ne pas doubler
    const alreadyTappedTimes = this.tappedResults().map(r => r.expectedTimeMs);

    // On cherche la note la plus proche qui n'a pas encore été "tappée"
    this._expectedTaps.forEach((exp, idx) => {
      if (alreadyTappedTimes.includes(exp.timeMs)) return;
      
      const diff = Math.abs(tapTime - exp.timeMs);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = idx;
      }
    });

    if (bestIdx === -1) return;

    // --- Nouvelle Stratégie de Précision Adaptative ---
    const bpm = this.metronome.bpm() || 60;
    const msPerBeat = 60000 / bpm;
    
    // Déterminer la durée de la figure de référence pour la marge (par défaut 'dc' = double croche)
    const errorMargeCode = this.data()?.noteErrorMarge || 'dc';
    const durationMap: Record<string, number> = { 'w': 4, 'h': 2, 'q': 1, '8': 0.5, '16': 0.25, 'dc': 0.25, 'c': 0.5, 'n': 1 };
    const referenceDurationMs = (durationMap[errorMargeCode] || 0.25) * msPerBeat;

    // Marges en pourcentage de la figure de référence selon la difficulté
    // Level 1: Perfect < 50%, Good < 85%
    // Level 2: Perfect < 35%, Good < 65%
    // Level 3: Perfect < 20%, Good < 40%
    const difficultyFactors = [
      { p: 0.50, g: 0.85 }, 
      { p: 0.35, g: 0.65 }, 
      { p: 0.20, g: 0.40 }
    ];
    const factor = difficultyFactors[this.difficultyLevel() - 1];
    
    const perfectMargin = referenceDurationMs * factor.p;
    const goodMargin = referenceDurationMs * factor.g;
    
    let feedback: 'perfect' | 'good' | 'bad' = 'bad';
    if (bestDiff < perfectMargin) feedback = 'perfect';
    else if (bestDiff < goodMargin) feedback = 'good';

    const result: ITapResult = {
      expectedTimeMs: this._expectedTaps[bestIdx].timeMs,
      actualTimeMs: tapTime,
      precision: feedback,
      diffMs: bestDiff
    };
    
    // Mise à jour groupée pour limiter les cycles de détection de changement
    this.tappedResults.update(prev => [...prev, result]);
    this.lastFeedback.set(feedback);
    
    if (feedback === 'perfect') this.results.update(r => ({ ...r, perfect: r.perfect + 1 }));
    else if (feedback === 'good') this.results.update(r => ({ ...r, good: r.good + 1 }));
    else this.results.update(r => ({ ...r, bad: r.bad + 1 }));

    setTimeout(() => this.lastFeedback.set(null), 1000);
  }

  handleDifficultyChange(level: number): void {
    this.difficultyLevel.set(level);
  }

  handleTempoChange(newTempo: number): void {
    this.metronome.setBpm(newTempo);
    this._prepareExpectedTaps();
  }

  handleVolumeChange(vol: number): void {
    this.metronomeVolume.set(vol);
  }

  handleCountdownChange(val: number): void {
    this.countdownMeasures.set(val);
  }

  handlePreviousSequence(): void {
    this._postMessageService.emitToParent({ eventName: 'NAV_PREV_SEQ' });
  }

  handleNextSequence(): void {
    this._postMessageService.emitSequenceChange();
  }

  ngOnDestroy(): void {
    this.metronome.stop();
    this._stopProgressTracking();
  }
}
