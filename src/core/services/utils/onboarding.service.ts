import { inject, Injectable, signal } from '@angular/core';
import { driver, Driver, DriveStep, Config } from 'driver.js';
import { LocalStorageService } from './local-storage.service';

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
}
