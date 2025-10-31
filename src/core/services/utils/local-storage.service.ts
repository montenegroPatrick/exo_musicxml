import { Injectable } from '@angular/core';
import { Level } from '../../../app/flat/models/tap.model';

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
  set(key: string, value: object) {
    try {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
    } catch (err) {
      console.error('Error saving settings to localStorage:', err);
    }
  }
  get(key: string) {
    try {
      const json = localStorage.getItem(key);
      if (!json) {
        return null;
      }
      return JSON.parse(json);
    } catch (err) {
      console.error('Error loading settings from localStorage:', err);
      return null;
    }
  }
  saveSettings(settings: ExerciseSettings): void {
    try {
      this.set(SETTINGS_KEY, settings);
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

  loadSettings(): ExerciseSettings {
    try {
      const settings = this.get(SETTINGS_KEY);
      if (!settings) {
        return { ...DEFAULT_SETTINGS };
      }
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
