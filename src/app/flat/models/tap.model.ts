export interface IUserTap {
  timeMs: number;
  result: 'Good' | 'Late' | 'Too late' | 'Early' | 'Too early';
  diffMs: number;
}

export interface IJsonXml {
  notes?: number[];
  duration?: number;
}

export type ExerciseStatus = 'not-started' | 'playing' | 'finish';
export type CountInStatus = 'not-started' | 'play' | 'finish';
export type Level = 1 | 1.1 | 1.2 | 1.3 | 1.4 | 1.5;
export interface LevelOptions {
  label: string;
  value: Level;
}
export const LEVEL_OPTIONS: LevelOptions[] = [
  { label: 'Débutant', value: 1 },
  { label: 'Débutant +', value: 1.1 },
  { label: 'Intermédiaire', value: 1.2 },
  { label: 'Intermédiaire +', value: 1.3 },
  { label: 'Pro', value: 1.4 },
  { label: 'Expert', value: 1.5 },
];
