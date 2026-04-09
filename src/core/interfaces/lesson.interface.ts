export type LessonModuleType = 'video' | 'video-img' | 'img';
export type ImgType = 'xml' | 'eps' | 'pdf';
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

export interface TrackList {
  pos?: number;
  label?: string;
  name?: string;
}

export interface ILesson {
  // Navigation Metadata
  chapter?: number;
  subChapter?: number;
  sequence?: number;
  chapterTitle?: string;
  subChapterTitle?: string;
  sequenceTitle?: string;

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
  videoSync?: Sync[] | string | null;

  // Audio
  audioUrl?: string;
}

export interface ILessonContext extends ILesson {
  lessonId: string;
  seq: string;
  moduleType: LessonModuleType;
  imgType?: ImgType;
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
 * - video-img: loadVideo=true and loadImg=true
 * - img: loadImg=true and loadVideo=false
 */
export function determineModuleType(lesson: ILesson): LessonModuleType {
  const hasVideo = lesson.loadVideo === true;
  const hasImg = lesson.loadImg === true;

  if (hasVideo && hasImg) {
    return 'video-img';
  }
  if (hasVideo) {
    return 'video';
  }
  return 'img';
}

/**
 * Determines the image type based on lesson data
 */
export function determineImgType(lesson: ILesson): ImgType | undefined {
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
  return 'eps';
}

/**
 * Determines the control bar type based on lesson data and module type
 */
export function determineControlBarType(
  lesson: ILesson,
  moduleType: LessonModuleType,
): ControlBarType {
  const imgType = determineImgType(lesson);

  // video-img with xml -> video-xml control bar for sync
  if (moduleType === 'video-img' && imgType === 'xml') {
    return 'video-xml';
  }

  // img with xml -> video-xml for playback controls
  if (moduleType === 'img' && imgType === 'xml') {
    return 'audio-mixer';
  }

  // video or video-img with eps/pdf -> video control bar
  if (moduleType === 'video' || moduleType === 'video-img') {
    return 'video';
  }

  // img with audio -> audio-mixer
  if (lesson.loadAudio) {
    return 'audio-mixer';
  }

  // default for img
  return 'video';
}

/**
 * Checks if lesson has sync points (videoSync for video-img or sync for img)
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
