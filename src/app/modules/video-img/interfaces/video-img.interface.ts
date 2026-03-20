import { ImageItem, Sync } from '@app/modules/img/interfaces/img.interface';

export interface IVideoImg {
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
export interface IVideoImgLayout {
  imageRatio?: Iratio;
  imgPosition?: Iposition;
}
