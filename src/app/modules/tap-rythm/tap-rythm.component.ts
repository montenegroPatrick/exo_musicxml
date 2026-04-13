import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TapRythmService } from './services/tap-rythm.service';
import { ExerciseStateService } from './services/exercise-state.service';
import { TimerService } from './services/timer.service';
import { MetronomeService } from '../../../core/services/utils/metronome.service';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { CountdownDisplayComponent } from './components/countdown-display/countdown-display.component';
import { ExerciseResultsComponent } from './components/exercise-results/exercise-results.component';
import { TapVisualizerComponent } from './components/tap-visualizer/tap-visualizer.component';
import { TapButtonComponent } from './components/tap-button/tap-button.component';
import { ControlButtonsComponent } from './components/control-buttons/control-buttons.component';
import { SettingsButtonComponent } from './components/settings-button/settings-button.component';
import { Level } from './interface/flat.interface';
import { ControlBarComponent } from './components/control-bar/control-bar.component';
import { ButtonModule } from 'primeng/button';
import { TapEvaluationService } from '@app/modules/tap-rythm/services/tap-evaluation.service';
import { SoundService } from 'src/core/services/utils/sound-service.service';
import {
  L10N_LOCALE,
  L10nTranslatePipe,
  L10nTranslationService,
} from 'angular-l10n';
import { OnboardingService } from '../../../core/services/utils/onboarding.service';
import { HelpbuttonComponent } from './components/help-button/help-button.component';
import { PostMessageService } from './services/post-message.service';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { BottomButtonsComponent } from './components/bottom-buttons/bottom-buttons.component';
import { FlatService } from '@core/services/flat.service';

@Component({
  standalone: true,
  selector: 'app-tap-rythm',
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
  templateUrl: './tap-rythm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TapRythmPageComponent implements AfterViewInit, OnDestroy {
  readonly locale = inject(L10N_LOCALE);
  readonly translationService = inject(L10nTranslationService);
  
  @ViewChild('flatContainer') private readonly _flatContainer!: ElementRef<HTMLDivElement>;

  // -- Services --
  private readonly _tapRythmService = inject(TapRythmService);
  private readonly _flatService = inject(FlatService);
  private readonly _tapEvaluationService = inject(TapEvaluationService);
  private readonly _soundService = inject(SoundService);
  private readonly _onboardingService = inject(OnboardingService);
  private readonly _postMessageService = inject(PostMessageService);
  private readonly _route = inject(ActivatedRoute);

  readonly exerciseState = inject(ExerciseStateService);
  readonly timer = inject(TimerService);
  readonly metronome = inject(MetronomeService);

  // -- Private State --
  private readonly _currentSequence = signal<string>('7');
  private readonly _parts = signal<any[]>([]);

  // -- Reactive Mappings --
  readonly hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  readonly xmlContent = this._tapRythmService.musicXml;
  readonly jsonContent = this._tapRythmService.jsonXml;
  readonly isXmlError = this._tapRythmService.isError;
  
  readonly totalDurationMs = computed(() => this.jsonContent().duration ?? 100000);
  readonly partsSignal = this._parts.asReadonly();

  async ngAfterViewInit(): Promise<void> {
    const seq = this._route.snapshot.params['seq'] || '7';
    this._currentSequence.set(seq);

    await this._initializeFlat();
    this._initEmbedEvents();
  }

  private async _initializeFlat(): Promise<void> {
    this._flatService.initEmbed(this._flatContainer.nativeElement, {
      controlsDisplay: false,
      playbackMetronome: 'active',
      layout: 'responsive',
    });

    this._soundService.initAudioContext();
    await this._flatService.loadMusicXML(this.xmlContent());

    const nbMeasures = await this._flatService.getNbMeasures();
    this.exerciseState.setNbMeasures(nbMeasures ?? 0);
    this.exerciseState.setXmlIsLoaded(true);

    await this._flatService.setMetronomeMode(1);

    const details = await this._flatService.getMeasureDetails();
    if (details?.tempo?.bpm) {
      this.metronome.setOriginalBpm(details.tempo.bpm);
      this.metronome.setBpm(details.tempo.bpm);
    }

    if (this.exerciseState.level() !== 1) {
      this.handleLevelChange(this.exerciseState.level());
    }

    this.metronome.setTimeBeatType(details?.time?.['beat-type'] as number);
    this.metronome.setTimeSignature(details?.time?.beats || 4);

    // Sync persisted settings
    await this._flatService.setMasterVolume(this.exerciseState.masterVolume());
    await this._flatService.setPlaybackSpeed(this.exerciseState.level());
  }

  private _initEmbedEvents(): void {
    this._flatService.getParts().then((parts: any) => this._parts.set(parts || []));

    this._flatService.onPause(() => {
      this.timer.stop();
      this.exerciseState.setIsPlaying(false);
    });

    this._flatService.onStop(() => {
      this.timer.stop();
      this.metronome.stop();

      if (this.timer.currentTimeMs() >= this.totalDurationMs()) {
        this._tapEvaluationService.evaluateMissedTap(this.exerciseState.userTaps());
        this.exerciseState.setExerciseStatus('finish');
      } else {
        this.exerciseState.setExerciseStatus('not-started');
      }

      this.exerciseState.calculateResult();
      this.exerciseState.setIsPlaying(false);
    });
  }

  // -- Core Exercise Logic --

  startExercise(): void {
    this.exerciseState.resetTaps();
    this.timer.reset();
    this.exerciseState.setExerciseStatus('playing');
    this.exerciseState.setIsPlaying(true);
    
    this.metronome.startCountIn(() => {
      this.timer.start();
    });
  }

  handleUserTap(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    
    if (!this.exerciseState.canTap()) return;
    
    const tapMs = this.timer.currentTimeMs();
    this._soundService.playTapSound();
    
    const notes = this.jsonContent().notes ?? [];
    this.exerciseState.recordTap(tapMs, notes);
  }

  async toggleListen(): Promise<void> {
    const listening = this.exerciseState.isListening();
    
    if (listening) {
      await this._flatService.stop();
    } else {
      await this._flatService.play();
      const firstPart = this._parts()[0];
      if (firstPart?.uuid) {
        await this._flatService.setPartVolume(firstPart.uuid, 100);
      }
    }
    
    this.exerciseState.setIsListening(!listening);
  }

  async handlePlayStop(): Promise<void> {
    if (this.exerciseState.isPlaying()) {
      await this._flatService.stop();
      this.resetExercise();
    } else {
      await this._flatService.play();
      if (!this.exerciseState.isListening()) {
        this.startExercise();
      }

      // Small delay to ensure player is ready for volume adjustments
      setTimeout(async () => {
        const firstPart = this._parts()[0];
        if (firstPart?.uuid) {
          const vol = this.exerciseState.partSound() ? 100 : 0;
          await this._flatService.setPartVolume(firstPart.uuid, vol);
        }
      }, 500);
    }
  }

  resetExercise(): void {
    this.exerciseState.reset();
    this.timer.reset();
    this.metronome.reset();
  }

  handleContinue(): void {
    this._postMessageService.emitSequenceChange();
  }

  // -- Settings Adjustments --

  async handleMasterVolumeChange(value: number): Promise<void> {
    this.exerciseState.setMasterVolume(value);
    await this._flatService.setMasterVolume(value);
  }

  handleTapVolumeChange(value: number): void {
    this.exerciseState.setTapVolume(value);
  }

  async handleLevelChange(value: Level): Promise<void> {
    this.exerciseState.setLevel(value);
    await this._flatService.setPlaybackSpeed(value);
    this.metronome.setBpm(this.metronome.originalBpm() * value);
    this._tapRythmService.changeSpeedNotes(value);
  }

  async handlePartSoundChange(value: boolean): Promise<void> {
    this.exerciseState.setPartSound(value);
    const firstPart = this._parts()[0];
    if (this.exerciseState.isPlaying() && firstPart?.uuid) {
      const vol = value ? 100 : 0;
      await this._flatService.setPartVolume(firstPart.uuid, vol);
    }
  }

  startOnboarding(): void {
    this._onboardingService.startTour(this._onboardingService.defaultExoxmlTourSteps());
  }

  ngOnDestroy(): void {
    this._flatService.destroyEmbed();
  }
}
