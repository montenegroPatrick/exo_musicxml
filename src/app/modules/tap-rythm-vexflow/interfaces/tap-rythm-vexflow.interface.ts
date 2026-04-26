export interface ITapRythmVexflowData {
  chapter?: number;
  subChapter?: number;
  sequence?: number;
  chapterTitle?: string;
  subChapterTitle?: string;
  sequenceTitle?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  noteErrorMarge: string;
  mesureDivision: string; // e.g. "44"
  id: string;
  tempo: string;
  mesureSize: string;
  mesureList: string[]; // e.g. ["s,n,n,s", "n,n,s,n", "n,n,dp", "n,dp,n"]
}

export type ExerciseStatus = 'not-started' | 'countdown' | 'playing' | 'finish';

export interface ITapResult {
  expectedTimeMs: number;
  actualTimeMs: number | null;
  precision: 'perfect' | 'good' | 'bad' | 'missed';
  diffMs: number;
}

export interface IMeasureInfo {
  index: number;
  notes: IRhythmNote[];
}

export interface IRhythmNote {
  type: string; // 'n', 's', 'dp', etc.
  duration: string; // VexFlow duration string 'q', 'qr', 'h', etc.
  isRest: boolean;
  timeMs: number; // Theoretical time in the exercise
  expectTap: boolean; // Whether the user should tap on this note
}
