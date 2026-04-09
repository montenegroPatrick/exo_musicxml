export type LessonModuleType = 'video' | 'video-diapo' | 'diapo';
export type DiapoType = 'xml' | 'eps' | 'pdf' | 'html';
export type ControlBarType = 'video' | 'video-xml' | 'audio-mixer';

export interface ImageItem {
  pos?: number;
  url?: string;
  ext?: string;
}

export interface Location {
  measureIdx: number;
}

export interface Sync {
  type: 'measure' | 'end';
  time: number;
  location: Location;
}

export interface IVideoSync {
  timeCode: number;
  pos: number;
}

export interface TrackList {
  pos?: number;
  label?: string;
  name?: string;
}

export interface ILesson {
  // Navigation Metadata
  Chapter?: number;
  SubChapter?: number;
  Sequence?: number;
  ChapterTitle?: string;
  SubChapterTitle?: string;
  SequenceTitle?: string;

  // Media Loading Flags
  loadVideo?: boolean;
  loadAudio?: boolean;
  loadImg?: boolean;

  // Video Properties
  extM3U8?: string;
  intM3U8?: string;
  jw?: string;
  videoName?: string;
  subtitles?: any[];

  // Image Properties
  typeImg?: string;
  printable?: boolean;
  printExt?: string;
  pos?: number;
  imageList?: ImageItem[];
  url?: string;

  // XML Properties
  folder?: string;
  trackList?: TrackList[];
  timeline?: any[];
  sync?: Sync[];

  // Synchronization
  videoSync?: IVideoSync[] | Sync[] | string | null;

  // Audio
  audioUrl?: string;
}

export interface ILessonContext extends ILesson {
  lessonId: string;
  seq: string;
  moduleType: LessonModuleType;
  diapoType?: DiapoType;
  controlBarType: ControlBarType;
  hasVideo: boolean;
  hasAudio: boolean;
  hasImg: boolean;
  hasXml: boolean;
  hasSyncPoints: boolean;
}

/**
 * Determines the module type based on lesson data
 * - video: loadVideo=true and loadImg=false
 * - video-diapo: loadVideo=true and loadImg=true
 * - diapo: loadImg=true and video = false
 */
export function determineModuleType(lesson: ILesson): LessonModuleType {
  const hasVideo = lesson.loadVideo === true;
  const hasImg = lesson.loadImg === true;

  if (hasVideo && hasImg) {
    return 'video-diapo';
  }
  if (hasVideo) {
    return 'video';
  }
  return 'diapo';
}

/**
 * Determines the diapo (image) type based on lesson data
 */
export function determineImgType(lesson: ILesson): DiapoType | undefined {
  if (!lesson.loadImg) {
    return undefined;
  }

  const typeImg = lesson.typeImg?.toLowerCase();

  if (typeImg === 'xml' || lesson.sync || lesson.trackList) {
    return 'xml';
  }
  if (typeImg === 'pdf' || (lesson.url && lesson.url.endsWith('.pdf'))) {
    return 'pdf';
  }
  if (typeImg === 'html' || (lesson.url && (lesson.url.startsWith('http') || lesson.url.endsWith('.html')))) {
    return 'html';
  }
  return 'eps';
}

/**
 * Determines the control bar type based on lesson data and module type
 */
export function determineControlBarType(
  lesson: ILesson,
  moduleType: LessonModuleType,
): ControlBarType {
  const diapoType = determineImgType(lesson);

  // video-diapo with xml -> video-xml control bar for sync
  if (moduleType === 'video-diapo' && diapoType === 'xml') {
    return 'video-xml';
  }

  // diapo with xml -> audio-mixer (legacy behavior)
  if (moduleType === 'diapo' && diapoType === 'xml') {
    return 'audio-mixer';
  }

  // video or video-diapo with other media -> video control bar
  if (moduleType === 'video' || moduleType === 'video-diapo') {
    return 'video';
  }

  // diapo with audio -> audio-mixer
  if (lesson.loadAudio) {
    return 'audio-mixer';
  }

  // default for diapo
  return 'video';
}

/**
 * Checks if lesson has sync points (videoSync for video-diapo or sync for diapo)
 */
export function hasSyncPoints(lesson: ILesson): boolean {
  if (Array.isArray(lesson.videoSync) && lesson.videoSync.length > 0) {
    return true;
  }
  if (Array.isArray(lesson.sync) && lesson.sync.length > 0) {
    return true;
  }
  return false;
}
