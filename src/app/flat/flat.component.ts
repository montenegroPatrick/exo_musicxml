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
import { TapRythmService } from './service/tap-rythm.service';
import { ExerciseStateService } from '../services/exercise-state.service';
import { TimerService } from '../services/timer.service';
import { MetronomeService } from '../services/metronome.service';
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
import { TapEvaluationService } from '@app/services/tap-evaluation.service';

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
  ],
  templateUrl: './flat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlatComponent implements AfterViewInit {
  @ViewChild('flatContainer') flatContainer!: ElementRef<HTMLDivElement>;

  private tapRythmService = inject(TapRythmService);
  protected exerciseState = inject(ExerciseStateService);
  protected timer = inject(TimerService);
  protected metronome = inject(MetronomeService);
  protected tapEvaluationService = inject(TapEvaluationService);
  private embed: Embed | undefined;

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
  }

  private initEmbedEvents = async () => {
    const parts = await this.embed?.getParts();

    this.partsSignal.set(parts || []);
    this.embed?.on('play', async () => {});

    this.embed?.on('pause', () => {
      console.log('pause');
      this.timer.stop();
      this.exerciseState.setIsPlaying(false);
    });

    this.embed?.on('stop', () => {
      console.log('stop');
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
  handleUserTap = () => {
    const tapMs = this.timer.currentTimeMs();
    const notes = this.jsonContent().notes ?? [];
    this.exerciseState.recordTap(tapMs, notes);
  };

  handleToggleListen = async () => {
    console.log('handleToggleListen', this.exerciseState.isListening());
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
      console.log('parts', this.partsSignal());
      console.log('partUuid', this.partsSignal()?.[0]?.uuid);
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
      console.log('partsVolumes', partsVolumes);
    }
  };

  resetExercice = () => {
    this.exerciseState.reset();
    this.timer.reset();
    this.metronome.reset();
  };

  handleContinue = () => {
    // To be implemented: navigate to next exercise
    console.log('Continue to next exercise');
  };

  handleMasterVolumeChange = async (value: number) => {
    console.log('volume', value);
    this.exerciseState.setMasterVolume(value);
    await this.embed?.setMasterVolume({ volume: value });
  };
  handleMetronomeVolumeChange = async (value: number) => {
    console.log('volume', value);
  };
  handleTapVolumeChange = async (value: number) => {
    console.log('volume', value);
    this.exerciseState.setTapVolume(value);
  };
  handleLevelChange = async (value: Level) => {
    console.log('level', value);
    this.exerciseState.setLevel(value);
    await this.embed?.setPlaybackSpeed(value);
    this.metronome.setBpm(this.metronome.originalBpm() * value);
    console.log('new bpm', this.metronome.bpm());

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
}
