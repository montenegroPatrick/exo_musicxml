import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseStateService } from '@app/modules/tap-rythm/services/exercise-state.service';
import { ControlButtonsComponent } from '@app/modules/tap-rythm/components/control-buttons/control-buttons.component';
import { SettingsButtonComponent } from '@app/modules/tap-rythm/components/settings-button/settings-button.component';
import { HelpbuttonComponent } from '@app/modules/tap-rythm/components/help-button/help-button.component';
import { FlatService } from '@core/services/flat.service';
import { TapRythmService } from '@app/modules/tap-rythm/services/tap-rythm.service';
import { OnboardingService } from '@core/services/utils/onboarding.service';
import { TimerService } from '@app/modules/tap-rythm/services/timer.service';
import { Level } from '@app/modules/tap-rythm/interface/flat.interface';
import { LessonMetadataComponent } from '@app/modules/control-bar/components/lesson-metadata/lesson-metadata.component';
import { BridgeService } from '@core/services/bridge.service';

@Component({
  selector: 'app-tap-rythm-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SettingsButtonComponent,
    HelpbuttonComponent,
    LessonMetadataComponent
  ],
  templateUrl: './tap-rythm-bar.component.html',
  styleUrl: './tap-rythm-bar.component.css'
})
export class TapRythmBarComponent {
  readonly exerciseState = inject(ExerciseStateService);
  private readonly _flatService = inject(FlatService);
  private readonly _tapRythmService = inject(TapRythmService);
  private readonly _onboardingService = inject(OnboardingService);
  readonly timer = inject(TimerService);
  
  readonly totalDuration = computed(() => (this._tapRythmService.jsonXml()?.duration ?? 100000) + 1000);
  readonly currentTime = computed(() => this.timer.currentTimeMs());
  readonly taps = computed(() => this.exerciseState.userTaps());
  readonly nbMeasures = computed(() => this.exerciseState.nbMeasures());

  readonly measureTimes = computed(() => {
    const times: number[] = [];
    const count = this.nbMeasures();
    const duration = this.totalDuration();
    if (count <= 0) return [];
    
    for (let i = 0; i <= count; i++) {
      times.push((i * (duration - 1000)) / count);
    }
    return times;
  });

  getTapColor(result: string): string {
    switch (result) {
      case 'Good':
        return 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]';
      case 'Late':
      case 'Early':
        return 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]';
      case 'Too early':
      case 'Too late':
        return 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]';
      default:
        return 'bg-zinc-500';
    }
  }
  // We can fetch it on the fly or it should be somewhere. For now let's just do it directly.

  async toggleListen(): Promise<void> {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const listening = this.exerciseState.isListening();
    if (listening) {
      await this._flatService.stop();
    } else {
      await this._flatService.play();
      const parts = await this._flatService.getParts();
      const firstPart = parts?.[0];
      if (firstPart?.uuid) {
        await this._flatService.setPartVolume(firstPart.uuid, 100);
      }
    }
    this.exerciseState.setIsListening(!listening);
  }

  async handlePlayStop(): Promise<void> {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (this.exerciseState.isPlaying()) {
      await this._flatService.stop();
      this.resetExercise();
    } else {
      if (!this.exerciseState.isListening()) {
        this.startExercise();
      }
      await this._flatService.play();

      setTimeout(async () => {
        const parts = await this._flatService.getParts();
        const firstPart = parts?.[0];
        if (firstPart?.uuid) {
          const vol = this.exerciseState.partSound() ? 100 : 0;
          await this._flatService.setPartVolume(firstPart.uuid, vol);
        }
      }, 500);
    }
  }

  startExercise(): void {
    this.exerciseState.resetTaps();
    this.timer.reset();
    this.exerciseState.setExerciseStatus('playing');
    this.exerciseState.setIsPlaying(true);
  }

  resetExercise(): void {
    this.exerciseState.reset();
    this.timer.reset();
  }

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
    this._tapRythmService.changeSpeedNotes(value);
  }

  async handlePartSoundChange(value: boolean): Promise<void> {
    this.exerciseState.setPartSound(value);
    const parts = await this._flatService.getParts();
    const firstPart = parts?.[0];
    if (this.exerciseState.isPlaying() && firstPart?.uuid) {
      const vol = value ? 100 : 0;
      await this._flatService.setPartVolume(firstPart.uuid, vol);
    }
  }

  startOnboarding(): void {
    this._onboardingService.startTour(this._onboardingService.defaultExoxmlTourSteps());
  }

  private readonly _bridgeService = inject(BridgeService);

  handlePrevious(): void {
    this._bridgeService.sendAction('prev');
  }

  handleNext(): void {
    this._bridgeService.sendAction('next');
  }
}
