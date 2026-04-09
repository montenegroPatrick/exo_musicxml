import { ImageItem, Sync } from '@core/shared/diapo/interfaces/diapo.interface';

export interface IVideoDiapo {
  loadVideo?: boolean;
  extM3U8?: string;
  intM3U8?: string;
  jw?: string;
  videoName?: string;
  subtitles?: any[];
  videoSync?: Sync[];
  loadAudio?: boolean;
  typeImg?: string;
  loadImg?: boolean;
  url?: string;
  imageList?: ImageItem[];
  pos?: number;
  printable?: boolean;
}

export interface Location {
  measureIdx?: number;
}
export type Iposition = 'top' | 'bottom' | 'left' | 'right';
export type Iratio = '1/4' | '1/3' | '1/2' | 'full';

export interface IVideoDiapoLayout {
  imageRatio?: Iratio;
  imgPosition?: Iposition;
}
