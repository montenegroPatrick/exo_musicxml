import { inject, Injectable, signal } from '@angular/core';
import { driver, Driver, DriveStep, Config } from 'driver.js';
import { LocalStorageService } from './local-storage.service';
import { L10nTranslationService } from 'angular-l10n';

export interface OnboardingState {
  completed: boolean;
  lastCompletedStep?: number;
}

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  lastCompletedStep: undefined,
};

const ONBOARDING_KEY = 'onboarding-state';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private driverInstance?: Driver;
  private localStorageService = inject(LocalStorageService);
  private translationService = inject(L10nTranslationService);
  readonly isCompleted = signal<boolean>(this.loadState().completed);

  startTour(steps: DriveStep[], config?: Partial<Config>): void {
    const defaultConfig: Config = {
      showProgress: true,
      showButtons: ['next', 'previous'],
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      allowClose: true,
      steps,

      ...config,
      onDestroyStarted: (element, step, options) => {
        this.markCompleted();
        this.driverInstance?.destroy();
        config?.onDestroyStarted?.(element, step, options);
      },
    };

    this.driverInstance = driver(defaultConfig);

    this.driverInstance.drive();
  }

  stopTour(): void {
    if (this.driverInstance) {
      this.driverInstance.destroy();
      this.driverInstance = undefined;
    }
  }

  markCompleted(): void {
    this.saveState({ completed: true });
    this.isCompleted.set(true);
  }

  resetOnboarding(): void {
    this.saveState(DEFAULT_STATE);
    this.isCompleted.set(false);
  }

  private saveState(state: OnboardingState): void {
    try {
      this.localStorageService.set(ONBOARDING_KEY, state);
    } catch (error) {
      console.error('Error saving onboarding state to localStorage:', error);
    }
  }

  private loadState(): OnboardingState {
    try {
      const state = this.localStorageService.get(ONBOARDING_KEY);
      if (!state) {
        return { ...DEFAULT_STATE };
      }
      return { ...DEFAULT_STATE, ...state };
    } catch (error) {
      console.error('Error loading onboarding state from localStorage:', error);
      return { ...DEFAULT_STATE };
    }
  }

  defaultExoxmlTourSteps(): DriveStep[] {
    return [
      {
        element: '#onboarding-sheet-music',

        popover: {
          title: this.translationService.translate(
            'label.exo_xml.onboarding.sheet_music.title'
          ),
          description: this.translationService.translate(
            'label.exo_xml.onboarding.sheet_music.description'
          ),

          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#onboarding-play-controls',
        popover: {
          title: this.translationService.translate(
            'label.exo_xml.onboarding.play_controls.title'
          ),
          description: this.translationService.translate(
            'label.exo_xml.onboarding.play_controls.description'
          ),

          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#onboarding-tap-button',
        popover: {
          title: this.translationService.translate(
            'label.exo_xml.onboarding.tap_button.title'
          ),
          description: this.translationService.translate(
            'label.exo_xml.onboarding.tap_button.description'
          ),

          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#onboarding-settings',
        popover: {
          title: this.translationService.translate(
            'label.exo_xml.onboarding.settings.title'
          ),
          description: this.translationService.translate(
            'label.exo_xml.onboarding.settings.description'
          ),
          side: 'bottom',
          align: 'end',
        },
      },
      {
        popover: {
          title: this.translationService.translate(
            'label.exo_xml.onboarding.complete.title'
          ),
          description: this.translationService.translate(
            'label.exo_xml.onboarding.complete.description'
          ),
        },
      },
    ];
  }
}
