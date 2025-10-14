import { Injectable } from '@angular/core';
import { Level } from '../flat/models/tap.model';

export interface ExerciseSettings {
  level: Level;
  partSound: boolean;
  masterVolume: number;
  tapVolume: number;
  metronomeVolume: number;
}

const DEFAULT_SETTINGS: ExerciseSettings = {
  level: 1,
  partSound: false,
  masterVolume: 100,
  tapVolume: 100,
  metronomeVolume: 100,
};

const SETTINGS_KEY = 'exercise-settings';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  saveSettings(settings: ExerciseSettings): void {
    try {
      const json = JSON.stringify(settings);
      localStorage.setItem(SETTINGS_KEY, json);
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

  loadSettings(): ExerciseSettings {
    try {
      const json = localStorage.getItem(SETTINGS_KEY);
      if (!json) {
        return { ...DEFAULT_SETTINGS };
      }
      const settings = JSON.parse(json) as ExerciseSettings;
      return { ...DEFAULT_SETTINGS, ...settings };
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  clearSettings(): void {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Error clearing settings from localStorage:', error);
    }
  }
}
