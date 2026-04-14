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
  type: 'measure' | 'end' | 'start';
  time: number;
  location?: Location;
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
  chapter?: number;
  subChapter?: number;
  sequence?: number;
  chapterTitle?: string;
  subChapterTitle?: string;
  sequenceTitle?: string;
  courseTitle?: string;
  navigationTitle?: string;

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

  // XML & Data Properties
  folder?: string;
  trackList?: TrackList[];
  timeline?: any[];
  sync?: Sync[];
  videoSync?: IVideoSync[] | Sync[] | string | null;

  // Audio & Media IDs
  audioUrl?: string;
  jw_player_id?: string | number;
  youtube_id?: string;
  vimeo_id?: string;

  // Additional Metadata (Compatibility / Legacy Casing)
  titre?: string;
  compositeur?: string;
  producteur?: string;
  Chapter?: number;
  Sequence?: number;
  SubChapter?: number;
  ChapterTitle?: string;
  SubChapterTitle?: string;
  SequenceTitle?: string;
  CourseTitle?: string;
  NavigationTitle?: string;
  Folder?: string;
  TrackList?: TrackList[];
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
 */
export function determineModuleType(lesson: ILesson): LessonModuleType {
  const hasVideo = lesson.loadVideo === true;
  const hasImg = lesson.loadImg === true;

  if (hasVideo && hasImg) return 'video-diapo';
  if (hasVideo) return 'video';
  return 'diapo';
}

/**
 * Determines the diapo (image) type based on lesson data
 */
export function determineImgType(lesson: ILesson): DiapoType | undefined {
  const typeImg = lesson.typeImg?.toLowerCase();
  const url = lesson.url?.toLowerCase();
  
  // 1. Détection XML prioritaire (via type, URL ou structure de données)
  if (typeImg === 'xml' || url?.endsWith('.xml') || lesson.sync || lesson.trackList || lesson.TrackList) {
    return 'xml';
  }

  // 2. Détection PDF/HTML via URL ou type
  if (typeImg === 'pdf' || url?.endsWith('.pdf')) return 'pdf';
  if (typeImg === 'html' || url?.endsWith('.html') || url?.endsWith('.htm')) return 'html';

  // 3. Fallback EPS (Slideshow d'images) uniquement si loadImg est présent ou s'il y a une liste d'images
  if (lesson.loadImg || (lesson.imageList && lesson.imageList.length > 0)) {
    return 'eps';
  }

  return undefined;
}

/**
 * Determines the control bar type based on lesson data and module type
 */
export function determineControlBarType(lesson: ILesson, moduleType: LessonModuleType): ControlBarType {
  const diapoType = determineImgType(lesson);

  if (moduleType === 'video-diapo' && diapoType === 'xml') return 'video-xml';
  if (moduleType === 'diapo' && diapoType === 'xml') return 'audio-mixer';
  if (moduleType === 'video' || moduleType === 'video-diapo') return 'video';
  if (lesson.loadAudio) return 'audio-mixer';
  return 'video';
}

/**
 * Checks if lesson has sync points
 */
export function hasSyncPoints(lesson: ILesson): boolean {
  if (Array.isArray(lesson.videoSync) && lesson.videoSync.length > 0) return true;
  if (Array.isArray(lesson.sync) && lesson.sync.length > 0) return true;
  return false;
}
