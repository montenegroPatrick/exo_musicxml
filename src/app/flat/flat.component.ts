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
import { L10N_LOCALE, L10nTranslatePipe } from 'angular-l10n';
import { OnboardingService } from '../../core/services/utils/onboarding.service';
import { DriveStep } from 'driver.js';

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
  ],
  templateUrl: './flat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlatComponent implements AfterViewInit {
  locale = inject(L10N_LOCALE);
  @ViewChild('flatContainer') flatContainer!: ElementRef<HTMLDivElement>;
  // injects
  private tapRythmService = inject(TapRythmService);
  protected exerciseState = inject(ExerciseStateService);
  protected timer = inject(TimerService);
  protected metronome = inject(MetronomeService);
  protected tapEvaluationService = inject(TapEvaluationService);
  protected soundService = inject(SoundService);
  private onboardingService = inject(OnboardingService);
  private embed: Embed | undefined;
  // computed
  hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  xmlContent = computed(() => this.tapRythmService.musicXml());
  jsonContent = computed(() => this.tapRythmService.jsonXml());
  isXmlError = computed(() => this.tapRythmService.isError());
  totalDurationMs = computed(() => this.jsonContent().duration ?? 100000);
  partsSignal = signal<any[]>([]);

  async ngAfterViewInit() {
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

    // Start onboarding tour if not completed
    if (!this.onboardingService.isCompleted()) {
      setTimeout(() => this.startOnboardingTour(), 500);
    }
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
  startListening = () => {};
  startExercice = () => {
    this.exerciseState.resetTaps();
    this.timer.reset();

    this.metronome.startCountIn(() => {
      this.timer.start();
    });
    this.exerciseState.setIsPlaying(true);
    this.exerciseState.setExerciseStatus('playing');
  };
  handleUserTap = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
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
    // To be implemented: navigate to next exercise
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
    const steps = this.buildTourSteps();
    this.onboardingService.startTour(steps);
  }

  private buildTourSteps(): DriveStep[] {
    const lang = this.locale.language;

    const getTranslation = (key: string): string => {
      const keys = key.split('.');
      let result: any = this.locale;

      try {
        const translations = (window as any).__L10N_TRANSLATIONS__;
        if (translations && translations[lang]) {
          let value = translations[lang];
          for (const k of keys) {
            value = value[k];
          }
          return value || key;
        }
      } catch (e) {
        console.warn('Translation not found:', key);
      }
      return key;
    };

    return [
      {
        element: '#onboarding-sheet-music',
        popover: {
          title: getTranslation('label.exo_xml.onboarding.sheet_music.title'),
          description: getTranslation('label.exo_xml.onboarding.sheet_music.description'),
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#onboarding-play-controls',
        popover: {
          title: getTranslation('label.exo_xml.onboarding.play_controls.title'),
          description: getTranslation('label.exo_xml.onboarding.play_controls.description'),
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#onboarding-tap-button',
        popover: {
          title: getTranslation('label.exo_xml.onboarding.tap_button.title'),
          description: getTranslation('label.exo_xml.onboarding.tap_button.description'),
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#onboarding-settings',
        popover: {
          title: getTranslation('label.exo_xml.onboarding.settings.title'),
          description: getTranslation('label.exo_xml.onboarding.settings.description'),
          side: 'bottom',
          align: 'end',
        },
      },
      {
        popover: {
          title: getTranslation('label.exo_xml.onboarding.complete.title'),
          description: getTranslation('label.exo_xml.onboarding.complete.description'),
        },
      },
    ];
  }
}
