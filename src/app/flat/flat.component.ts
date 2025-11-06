import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Embed from 'flat-embed';
import { TapRythmService } from './services/tap-rythm.service';
import { ExerciseStateService } from './services/exercise-state.service';
import { TimerService } from './services/timer.service';
import { MetronomeService } from '../../core/services/utils/metronome.service';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { CountdownDisplayComponent } from './components/countdown-display/countdown-display.component';
import { ExerciseResultsComponent } from './components/exercise-results/exercise-results.component';
import { TapVisualizerComponent } from './components/tap-visualizer/tap-visualizer.component';
import { TapButtonComponent } from './components/tap-button/tap-button.component';
import { ControlButtonsComponent } from './components/control-buttons/control-buttons.component';
import { SettingsButtonComponent } from './components/settings-button/settings-button.component';
import { Level } from './models/tap.model';
import { ControlBarComponent } from './components/control-bar/control-bar.component';
import { ButtonModule } from 'primeng/button';
import { TapEvaluationService } from '@app/flat/services/tap-evaluation.service';
import { SoundService } from 'src/core/services/utils/sound-service.service';
import {
  L10N_LOCALE,
  L10nTranslatePipe,
  L10nTranslationService,
} from 'angular-l10n';
import { OnboardingService } from '../../core/services/utils/onboarding.service';
import { DriveStep } from 'driver.js';
import { HelpbuttonComponent } from './components/help-button/help-button.component';
import { PostMessageService } from './services/post-message.service';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { BottomButtonsComponent } from './components/bottom-buttons/bottom-buttons.component';
@Component({
  standalone: true,
  selector: 'app-flat',
  imports: [
    ErrorMessageComponent,
    CountdownDisplayComponent,
    ExerciseResultsComponent,
    TapVisualizerComponent,
    TapButtonComponent,
    ControlButtonsComponent,
    SettingsButtonComponent,
    ControlBarComponent,
    ButtonModule,
    L10nTranslatePipe,
    HelpbuttonComponent,
    ToggleSwitch,
    BottomButtonsComponent,
    FormsModule,
  ],

  templateUrl: './flat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlatComponent implements AfterViewInit {
  locale = inject(L10N_LOCALE);
  translationService = inject(L10nTranslationService);
  @ViewChild('flatContainer') flatContainer!: ElementRef<HTMLDivElement>;
  // injects
  private tapRythmService = inject(TapRythmService);
  protected exerciseState = inject(ExerciseStateService);
  protected timer = inject(TimerService);
  protected metronome = inject(MetronomeService);
  protected tapEvaluationService = inject(TapEvaluationService);
  protected soundService = inject(SoundService);
  private onboardingService = inject(OnboardingService);
  private postMessageService = inject(PostMessageService);
  private route = inject(ActivatedRoute);
  private embed: Embed | undefined;
  private currentSequence = signal<string>('7');
  // computed
  hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  xmlContent = computed(() => this.tapRythmService.musicXml());
  jsonContent = computed(() => this.tapRythmService.jsonXml());
  isXmlError = computed(() => this.tapRythmService.isError());
  totalDurationMs = computed(() => this.jsonContent().duration ?? 100000);
  partsSignal = signal<any[]>([]);
  exoMode = false;

  async ngAfterViewInit() {
    // Récupérer l'ID de séquence depuis les paramètres de route
    const seq = this.route.snapshot.params['seq'] || '7';
    this.currentSequence.set(seq);

    const width = window.innerWidth;

    this.embed = new Embed(this.flatContainer.nativeElement, {
      embedParams: {
        appId: TapRythmService.FLAT_APP_ID,
        controlsDisplay: false,
        playbackMetronome: 'active',
        layout: 'responsive',
        zoom: width > 800 ? 'auto' : 1,
        displayFirstLinePartsNames: false,
        hideTempo: true,
      },
    });

    this.soundService.initAudioContext();
    await this.embed?.loadMusicXML(this.xmlContent());
    const nbMeasures = await this.embed?.getNbMeasures();
    this.exerciseState.setNbMeasures(nbMeasures);
    this.exerciseState.setXmlIsLoaded(true);
    await this.embed?.setMetronomeMode(1);
    const mesureDetails = await this.embed?.getMeasureDetails();
    this.metronome.setOriginalBpm(mesureDetails?.tempo?.bpm || 0);
    this.metronome.setBpm(mesureDetails?.tempo?.bpm || 0);
    if (this.exerciseState.level() !== 1) {
      this.handleLevelChange(this.exerciseState.level());
    }
    this.metronome.setTimeBeatType(
      mesureDetails?.time?.['beat-type'] as number
    );

    this.metronome.setTimeSignature(mesureDetails?.time?.beats || 4);

    // Apply saved settings
    await this.embed?.setMasterVolume({
      volume: this.exerciseState.masterVolume(),
    });
    await this.embed?.setPlaybackSpeed(this.exerciseState.level());

    this.initEmbedEvents();

    // No Start on init for the moment  onboarding tour if not completed
    // if (!this.onboardingService.isCompleted()) {
    //   setTimeout(() => this.startOnboardingTour(), 500);
    // }
  }

  private initEmbedEvents = async () => {
    const parts = await this.embed?.getParts();

    this.partsSignal.set(parts || []);
    this.embed?.on('play', async () => {});

    this.embed?.on('pause', () => {
      this.timer.stop();
      this.exerciseState.setIsPlaying(false);
    });

    this.embed?.on('stop', () => {
      this.timer.stop();
      this.metronome.stop();

      if (this.timer.currentTimeMs() >= this.totalDurationMs()) {
        this.tapEvaluationService.evaluateMissedTap(
          this.exerciseState.userTaps()
        );
        this.exerciseState.setExerciseStatus('finish');
      } else {
        this.exerciseState.setExerciseStatus('not-started');
      }

      this.exerciseState.calculateResult();
      this.exerciseState.setIsPlaying(false);
    });
  };

  startExercice = () => {
    this.exerciseState.resetTaps();
    this.timer.reset();

    this.exerciseState.setExerciseStatus('playing');
    this.exerciseState.setIsPlaying(true);
    this.metronome.startCountIn(() => {
      this.timer.start();
    });
  };
  handleUserTap = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (!this.exerciseState.canTap()) return;
    const tapMs = this.timer.currentTimeMs();
    this.soundService.playTapSound();
    const notes = this.jsonContent().notes ?? [];
    this.exerciseState.recordTap(tapMs, notes);
  };

  handleToggleListen = async () => {
    if (this.exerciseState.isListening()) {
      this.embed?.stop();
    } else {
      this.embed?.play();
      await this.embed?.setPartVolume({
        partUuid: this.partsSignal()?.[0]?.uuid!,
        volume: 100,
      });
    }
    this.exerciseState.setIsListening(!this.exerciseState.isListening());
  };

  handlePlayStop = async () => {
    if (this.exerciseState.isPlaying()) {
      this.embed?.stop();
      this.resetExercice();
    } else {
      await this.embed?.play();
      if (!this.exerciseState.isListening()) this.startExercice();

      // await 1second to let the part be loaded
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        await this.embed?.setPartVolume({
          partUuid: this.partsSignal()?.[0]?.uuid!,
          volume: this.exerciseState.partSound() ? 100 : 0,
        });
      } catch (error) {
        console.error('Error setting part volume', error);
      }
      const partsVolumes = await this.embed?.getPartVolume({
        partUuid: this.partsSignal()?.[0]?.uuid!,
      });
    }
  };

  resetExercice = () => {
    this.exerciseState.reset();
    this.timer.reset();
    this.metronome.reset();
  };

  handleContinue = () => {
    const currentSeq = this.currentSequence();
    const nextSeq = (parseInt(currentSeq) + 1).toString();

    // Préparer les résultats de l'exercice
    const results = {
      percentage: this.exerciseState.resultPercentage(),
      totalNotes: this.exerciseState.totalNotes(),
      totalTaps: this.exerciseState.totalTaps(),
      goodTaps: this.exerciseState.goodTaps(),
      lateTaps: this.exerciseState.lateTaps(),
      earlyTaps: this.exerciseState.earlyTaps(),
      tooLateTaps: this.exerciseState.tooLateTaps(),
      tooEarlyTaps: this.exerciseState.tooEarlyTaps(),
      missedTaps: this.exerciseState.missedTaps(),
      level: this.exerciseState.level(),
    };

    // Envoyer l'événement au parent AngularJS
    this.postMessageService.emitSequenceChange();
  };

  handleMasterVolumeChange = async (value: number) => {
    this.exerciseState.setMasterVolume(value);
    await this.embed?.setMasterVolume({ volume: value });
  };
  handleMetronomeVolumeChange = async (value: number) => {};
  handleTapVolumeChange = async (value: number) => {
    this.exerciseState.setTapVolume(value);
  };
  handleLevelChange = async (value: Level) => {
    this.exerciseState.setLevel(value);
    await this.embed?.setPlaybackSpeed(value);
    this.metronome.setBpm(this.metronome.originalBpm() * value);

    this.tapRythmService.changeSpeedNotes(value);
    // recharger la page avec le nouvel exercice
  };
  handlePartSoundChange = async (value: boolean) => {
    this.exerciseState.setPartSound(value);
    if (this.exerciseState.isPlaying()) {
      await this.embed?.setPartVolume({
        partUuid: this.partsSignal()?.[0]?.uuid!,
        volume: this.exerciseState.partSound() ? 100 : 0,
      });
    }
  };

  startOnboardingTour(): void {
    this.onboardingService.startTour(
      this.onboardingService.defaultExoxmlTourSteps()
    );
  }
}
