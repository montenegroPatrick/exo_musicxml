import { DifficultyLevel } from './performance.model';

export const DIFFICULTY_LEVELS: Record<string, DifficultyLevel> = {
  beginner: {
    name: 'Débutant',
    windows: {
      perfect: 30,
      great: 70,
      good: 120,
      ok: 200,
    },
  },
  intermediate: {
    name: 'Intermédiaire',
    windows: {
      perfect: 20,
      great: 50,
      good: 100,
      ok: 150,
    },
  },
  advanced: {
    name: 'Avancé',
    windows: {
      perfect: 10,
      great: 30,
      good: 60,
      ok: 100,
    },
  },
};

export const DEFAULT_DIFFICULTY = DIFFICULTY_LEVELS['intermediate'];
