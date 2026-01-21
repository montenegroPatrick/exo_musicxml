export interface IVideoImg {
  loadVideo?: boolean;
  extM3U8?: string;
  intM3U8?: string;
  jw?: string;
  videoName?: string;
  subtitles?: any[];
  videoSync?: VideoSync[];
  loadAudio?: boolean;
  typeImg?: string;
  loadImg?: boolean;
  url?: string;
  pos?: number;
  printable?: boolean;
}

export interface VideoSync {
  type?: string;
  time?: number;
  location?: Location;
}

export interface Location {
  measureIdx?: number;
}
