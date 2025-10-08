import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import Embed from 'flat-embed';
import { TapRythmService } from './service/tap-rythm.service';
import { VirtualTimeScheduler } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { Knob } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
export interface IUserTap {
  timeMs: number;
  result: 'Good' | 'Too late' | 'Too early';
  diffMs: number;
}
@Component({
  standalone: true,
  selector: 'app-flat',
  imports: [ButtonModule, ProgressBarModule, Knob, FormsModule],
  templateUrl: './flat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlatComponent implements OnInit, AfterViewInit {
  @ViewChild('flatContainer') flatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('tapViewContainer') tapViewContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('tapButton') tapButton!: ElementRef<HTMLButtonElement>;
  private tapRythmService: TapRythmService = inject(TapRythmService);

  private embed: Embed | undefined;
  xmlIsLoaded = signal(false);

  // Timer en millisecondes
  private timerStartTime: number = 0;
  private timerIntervalId: any = null;
  private timerIntervalIdMetronome: any = null;
  public currentTimeMs = signal<number>(0);
  // mocks notes, we need to get them from the server api who gives us all the notes from the xml file later;
  notes = [
    6006.6666666667, 6753.333333333256, 7505.333333333321, 8251.999999999993,
    9009.333333333341, 9750.666666666613, 10502.66666666668, 11260.00000000003,
    12001.333333333301, 12758.666666666652, 13510.666666666606,
    14251.999999999993, 15009.333333333341, 15750.666666666615,
    16507.999999999964, 17260.00000000003, 18758.66666666665,
    19510.666666666606,
  ];

  userTaps = signal<IUserTap[]>([]);
  countInMetronome = signal<'not-started' | 'finish' | 'play'>('not-started');
  exerciceStatus = signal<'not-started' | 'finish' | 'playing'>('not-started');
  metronomeBPM = signal(0);
  metronomeTick = signal(1);
  timeSignature = signal(4);
  resultPercentage = 0;
  // Durée totale de l'exercice en ms (basée sur la dernière note + marge)
  readonly totalDurationMs = 10000;
  public isPlaying = signal(false);

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Space' && this.isPlaying()) {
      console.log('Space key pressed');
      event.preventDefault(); // Empêche le scroll
      this.tapButton.nativeElement.click();
      //this.handleUserTap();
    }
  }

  ngOnInit() {}
  async ngAfterViewInit() {
    this.embed = new Embed(this.flatContainer.nativeElement, {
      embedParams: {
        appId: TapRythmService.FLAT_APP_ID,
        controlsDisplay: false,
        playbackMetronome: 'active',
        playbackVolumeMaster: 0,
        displayFirstLinePartsNames: false,
        hideTempo: true,
      },
    });

    // Fix: Cast to any to bypass type error
    this.tapRythmService.xmlFetch().subscribe({
      next: async (xmlContent) => {
        await this.embed?.loadMusicXML(xmlContent);
        this.xmlIsLoaded.set(true);
        await this.embed?.setMetronomeMode(1);
        await this.embed?.setPartVolume({ partUuid: '0', volume: 0 });
        const mesureDetails = await this.embed?.getMeasureDetails();
        this.metronomeBPM.set(mesureDetails?.tempo?.bpm || 0);
        this.timeSignature.set(mesureDetails?.time?.beats || 4);
        this.initEmbedEvents();
      },
      error: (err) => {
        console.error('Erreur lors du chargement du XML:', err);
      },
    });
  }
  initEmbedEvents = async () => {
    this.embed?.on('play', async () => {
      console.log('play');
      this.startCountInMetronomeView();
      this.startTimer();
      this.isPlaying.set(true);
      this.exerciceStatus.set('playing');
    });

    this.embed?.on('pause', () => {
      console.log('pause');
      this.stopTimer();
      this.isPlaying.set(false);
    });

    this.embed?.on('stop', () => {
      console.log('stop');
      this.stopTimer();
      this.resetTimer();
      this.calculateUserExerciceResult();
      clearInterval(this.timerIntervalIdMetronome);
      this.countInMetronome.set('not-started');
      //todo switch on not-started or finish with the correct end of score time;
      this.exerciceStatus.set('finish');
      console.log('exerciceStatus', this.exerciceStatus());
      this.isPlaying.set(false);
    });
  };

  private startTimer(): void {
    if (this.timerIntervalId) {
      console.log('Timer already running');

      return; // Le timer est déjà en cours
    }

    this.timerStartTime = Date.now() - this.currentTimeMs();
    this.timerIntervalId = setInterval(() => {
      this.currentTimeMs.set(Date.now() - this.timerStartTime);
    }, 10); // Mise à jour toutes les 10ms pour une précision fine
  }

  private stopTimer(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  private resetTimer(): void {
    this.currentTimeMs.set(0);
    this.timerStartTime = 0;
  }

  handleUserTap = async () => {
    const tapMs = this.currentTimeMs();
    // if (userTap != 0) {
    //   this.userTaps.set([...this.userTaps(), userTap]);
    // }
    // evaluate the userTap against the notes
    let closestNoteMs: {
      noteMs: number;
      diffMs: number;
      index: number;
    } | null = null;
    let diffs = [];
    for (let i = 0; i < this.notes.length; i++) {
      const noteMs = Number(this.notes[i].toFixed(2));
      console.log('Note ms', noteMs);
      const diffMs = Math.abs(tapMs - noteMs);
      diffs.push({ diffMs, noteMs, index: i });
    }
    closestNoteMs = diffs.sort((a, b) => a.diffMs - b.diffMs)[0];

    if (
      tapMs === closestNoteMs.noteMs ||
      (tapMs > closestNoteMs.noteMs && closestNoteMs.diffMs < 200) ||
      (tapMs < closestNoteMs.noteMs && closestNoteMs.diffMs < 200)
    ) {
      this.userTaps.set([
        ...this.userTaps(),
        { timeMs: tapMs, result: 'Good', diffMs: closestNoteMs.diffMs },
      ]);
    } else if (tapMs > closestNoteMs.noteMs) {
      this.userTaps.set([
        ...this.userTaps(),
        {
          timeMs: tapMs,
          result: 'Too late',
          diffMs: closestNoteMs.diffMs,
        },
      ]);
    } else {
      this.userTaps.set([
        ...this.userTaps(),
        {
          timeMs: tapMs,
          result: 'Too early',
          diffMs: closestNoteMs.diffMs,
        },
      ]);
    }
    console.log('User taps', this.userTaps());
  };

  // Calcule la position d'un tap avec le défilement
  // La ligne fixe est au centre (50%), les taps défilent par rapport au temps
  getTapPositionWithScroll(tapTimeMs: number): string {
    if (!this.tapViewContainer) return '50%';

    const containerWidth = this.tapViewContainer.nativeElement.offsetWidth;
    const centerPosition = containerWidth / 2;

    // Différence de temps entre le tap et le temps actuel
    const timeDiff = tapTimeMs - this.currentTimeMs();

    // Conversion du temps en pixels (échelle: 1ms = 1px, ajustable)
    const pixelsPerMs = containerWidth / this.totalDurationMs;
    const offset = timeDiff * pixelsPerMs;

    const finalPosition = centerPosition + offset;
    return `${finalPosition}px`;
  }

  // Retourne la couleur de la barre de feedback selon le résultat
  getTapColor(result: string): string {
    switch (result) {
      case 'Good':
        return 'bg-green-500';
      case 'Too early':
        return 'bg-yellow-500';
      case 'Too late':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }
  resetExercice = () => {
    this.userTaps.set([]);
    this.countInMetronome.set('not-started');
    this.exerciceStatus.set('not-started');
    this.resultPercentage = 0;
    this.metronomeTick.set(1);
  };
  resetUserTaps = () => {
    this.userTaps.set([]);
  };
  handlePlayStop = () => {
    if (this.isPlaying()) {
      this.embed?.stop();
      this.resetUserTaps();
    } else {
      this.embed?.play();
    }
  };
  startCountInMetronomeView = () => {
    console.log('Metronome BPM', this.metronomeBPM());
    this.countInMetronome.set('play');
    // calculate the time between each tick
    const timeBetweenTicks = 60000 / this.metronomeBPM();
    console.log('Time between ticks', timeBetweenTicks);
    // set the interval

    this.timerIntervalIdMetronome = setInterval(() => {
      if (this.metronomeTick() === this.timeSignature()) {
        this.metronomeTick.set(1);
        this.countInMetronome.set('finish');
        clearInterval(this.timerIntervalIdMetronome);
      } else {
        this.metronomeTick.set(this.metronomeTick() + 1);
      }
    }, timeBetweenTicks);
  };
  calculateUserExerciceResult = () => {
    const goodTaps = this.userTaps().filter(
      (tap) => tap.result === 'Good'
    ).length;
    const tooEarlyTaps = this.userTaps().filter(
      (tap) => tap.result === 'Too early'
    ).length;
    const tooLateTaps = this.userTaps().filter(
      (tap) => tap.result === 'Too late'
    ).length;
    const totalTaps = this.userTaps().length;
    console.log('Good taps', goodTaps);
    if (goodTaps == 0) {
      this.resultPercentage = 0;
      return;
    }
    let percentageGood = (goodTaps / totalTaps) * 100;
    if (percentageGood == null) {
      percentageGood = 0;
    }
    let percentageTooEarly = (tooEarlyTaps / totalTaps) * 100;
    if (percentageTooEarly == null) {
      percentageTooEarly = 0;
    }
    let percentageTooLate = (tooLateTaps / totalTaps) * 100;
    if (percentageTooLate == null) {
      percentageTooLate = 0;
    }
    const result =
      percentageGood > 90
        ? 'Excellent'
        : percentageGood > 80
        ? 'Bien'
        : percentageGood > 70
        ? 'Passable'
        : 'Insuffisant';
    console.log('Result', percentageGood);
    this.resultPercentage = Math.round(percentageGood);
  };
}
