export type PlaybackState =
  | 'idle'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'complete';

export interface EmbedOptions {
  controlsDisplay?: boolean;
  playbackMetronome?: 'inactive' | 'active';
  embedMode?: 'readOnly' | 'edit';
  layout?: 'responsive' | 'page';
  zoom?: 'auto' | number;
  themeIconsPrimary?: string;
  themeControlsBackground?: string;
  branding?: boolean;
  displayOtherLinesPartsNames?: boolean;
  displayFirstLinePartsNames?: boolean;
  hideTempo?: boolean;
  playbackVolumeMaster?: number;
}

export interface MeasureDetails {
  tempo?: {
    bpm: number;
  };
  time?: {
    beats?: number;
    'beat-type'?: number;
  };
}

export interface Part {
  uuid: string;
  name?: string;
}
