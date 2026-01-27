export interface IImg {
  loadVideo?: boolean;
  extM3U8?: string;
  intM3U8?: string;
  jw?: string;
  videoName?: string;
  subtitles?: any[];
  videoSync?: string;
  loadAudio?: boolean;
  typeImg?: string;
  printable?: boolean;
  printExt?: string;
  loadImg?: boolean;
  pos?: number;
  imageList?: ImageItem[];
}

export interface ImageItem {
  pos?: number;
  url?: string;
  ext?: string;
}

export type ImgType = 'xml' | 'eps' | 'pdf';
export interface IJsonImgEps {
  loadVideo?: boolean;
  loadAudio?: boolean;
  printable?: boolean;
  printExt?: string;
  loadImg?: boolean;
  pos?: number;
  imageList?: ImageItem[];
}
export interface IJsonImgPdf {
  loadVideo?: boolean;
  loadAudio?: boolean;
  printable?: boolean;
  printExt?: string;
  loadImg?: boolean;
  pos?: number;
  url?: string;
  audioUrl?: string;
}
export interface IJSONImgXML {
  folder?: string;
  trackList?: TrackList[];
  timeline?: any[];
  sync?: Sync[];
  typeImg?: string;
  loadImg?: boolean;
  url?: string;
  pos?: number;
}

export interface Sync {
  type: 'measure' | 'end';
  time: number;
  location: Location;
}

export interface Location {
  measureIdx: number;
}

export interface TrackList {
  pos?: number;
  label?: string;
  name?: string;
}

export interface IJsonImgPdf {}
