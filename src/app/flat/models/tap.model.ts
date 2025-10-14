export interface IUserTap {
  timeMs: number;
  result: 'Good' | 'Too late' | 'Too early';
  diffMs: number;
}

export interface IJsonXml {
  notes?: number[];
  duration?: number;
}

export type ExerciseStatus = 'not-started' | 'playing' | 'finish';
export type CountInStatus = 'not-started' | 'play' | 'finish';
