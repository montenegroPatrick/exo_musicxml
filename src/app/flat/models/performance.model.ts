export type TapJudgment = 'perfect' | 'great' | 'good' | 'ok' | 'miss' | 'extra';

export interface TimingWindows {
  perfect: number;
  great: number;
  good: number;
  ok: number;
}

export interface EvaluatedTap {
  noteIndex: number | null;
  tapTime: number;
  expectedTime: number | null;
  error: number;
  judgment: TapJudgment;
  points: number;
}

export interface PerformanceMetrics {
  accuracy: number;
  totalPoints: number;
  maxPoints: number;

  perfectCount: number;
  greatCount: number;
  goodCount: number;
  okCount: number;
  missCount: number;
  extraTapsCount: number;

  averageError: number;
  standardDeviation: number;
  unstableRate: number;
  earlyLateBias: number;
}

export interface DifficultyLevel {
  name: string;
  windows: TimingWindows;
}

export interface NoteState {
  expectedTime: number;
  consumed: boolean;
  judgment?: TapJudgment;
  error?: number;
}
