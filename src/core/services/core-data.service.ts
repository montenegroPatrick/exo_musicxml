import { computed, Injectable, signal } from '@angular/core';
import { ILesson, Sync, IVideoSync, TrackList, determineControlBarType, determineModuleType, determineImgType } from '@core/interfaces/lesson.interface';

@Injectable({
  providedIn: 'root',
})
export class CoreDataService {
  // -- Private State (Signals) --
  private readonly _lessonJson = signal<ILesson | null>(null);
  private readonly _xmlContent = signal<string>('');
  private readonly _exercisePayload = signal<any>(null);

  // -- Interaction Requests (Agnostic Command Store) --
  private readonly _seekRequest = signal<{ time: number, timestamp: number } | null>(null);
  private readonly _loopRangeRequest = signal<{ start: number | null, end: number | null, source?: string, timestamp: number } | null>(null);
  private readonly _pauseRequest = signal<{ timestamp: number } | null>(null);
  private readonly _playRequest = signal<{ timestamp: number } | null>(null);
  private readonly _rateRequest = signal<{ rate: number, timestamp: number } | null>(null);

  private readonly _isSyncing = signal<boolean>(false);
  private readonly _syncMessage = signal<string>('Optimisation de la partition...');
  private readonly _isMidiMode = signal<boolean>(false);

  // -- Public Readonly Accessors --
  readonly lessonJson = this._lessonJson.asReadonly();
  readonly xmlContent = this._xmlContent.asReadonly();
  readonly exercisePayload = this._exercisePayload.asReadonly();
  readonly seekRequest = this._seekRequest.asReadonly();
  readonly loopRangeRequest = this._loopRangeRequest.asReadonly();
  readonly pauseRequest = this._pauseRequest.asReadonly();
  readonly playRequest = this._playRequest.asReadonly();
  readonly rateRequest = this._rateRequest.asReadonly();
  readonly isSyncing = this._isSyncing.asReadonly();
  readonly syncMessage = this._syncMessage.asReadonly();
  readonly isMidiMode = this._isMidiMode.asReadonly();

  /** Set the syncing state with an optional message */
  setSyncing(value: boolean, message: string = 'Optimisation...'): void {
    this._syncMessage.set(message);
    this._isSyncing.set(value);
  }

  setMidiMode(value: boolean): void {
    this._isMidiMode.set(value);
  }

  /** Request a global audio/video pause */
  requestPause(): void {
    this._pauseRequest.set({ timestamp: Date.now() });
  }

  /** Request a global audio/video play */
  requestPlay(): void {
    this._playRequest.set({ timestamp: Date.now() });
  }

  /** Request a change in playback rate */
  requestRate(rate: number): void {
    this._rateRequest.set({ rate, timestamp: Date.now() });
  }

  // -- Metadata Computeds --
  readonly chapter = computed(() => this.lessonJson()?.chapter ?? this.lessonJson()?.Chapter);
  readonly subChapter = computed(() => this.lessonJson()?.subChapter ?? this.lessonJson()?.SubChapter);
  readonly sequence = computed(() => this.lessonJson()?.sequence ?? this.lessonJson()?.Sequence);
  
  readonly chapterTitle = computed(() => this.lessonJson()?.chapterTitle ?? this.lessonJson()?.ChapterTitle ?? '');
  readonly subChapterTitle = computed(() => this.lessonJson()?.subChapterTitle ?? this.lessonJson()?.SubChapterTitle ?? '');
  readonly sequenceTitle = computed(() => this.lessonJson()?.sequenceTitle ?? this.lessonJson()?.SequenceTitle ?? '');
  readonly courseTitle = computed(() => this.lessonJson()?.courseTitle ?? this.lessonJson()?.CourseTitle);
  readonly navigationTitle = computed(() => this.lessonJson()?.navigationTitle ?? this.lessonJson()?.NavigationTitle);

  // -- Credits --
  readonly titre = computed(() => this.lessonJson()?.titre || '');
  readonly compositeur = computed(() => this.lessonJson()?.compositeur || '');
  readonly producteur = computed(() => this.lessonJson()?.producteur || '');

  // -- IDs & URLs --
  readonly jwPlayerId = computed(() => this.lessonJson()?.jw_player_id?.toString() || this.lessonJson()?.jw?.toString() || '');
  readonly youtubeId = computed(() => this.lessonJson()?.youtube_id || '');
  readonly vimeoId = computed(() => this.lessonJson()?.vimeo_id || '');
  readonly xmlUrl = computed(() => this.lessonJson()?.url || '');

  // -- Audio Paths --
  readonly folderSound = computed(() => this.lessonJson()?.folder ?? this.lessonJson()?.Folder ?? '');
  readonly trackList = computed(() => {
    const lesson = this.lessonJson();
    const tracks = lesson?.trackList ?? lesson?.TrackList;
    
    if (tracks && tracks.length > 0) return tracks;
    
    // Support for mono-track playback (audioUrl fallback)
    if (lesson?.audioUrl) {
      console.log('[CoreDataService] Creating virtual track for mono-audio playback');
      return [{
        name: lesson.audioUrl,
        label: 'AUDIO'
      }] as TrackList[];
    }
    
    return [];
  });

  // -- Module Configuration --
  readonly moduleType = computed(() => {
    const lesson = this.lessonJson();
    return lesson ? determineModuleType(lesson) : 'video';
  });

  readonly controlBarType = computed(() => {
    const search = window.location.search;
    if (search.includes('mock=lesson_playback_xml')) return 'audio-mixer';
    if (search.includes('mock=video-img-xml-sync')) return 'video-xml';
    if (search.includes('mock=flat-score')) return 'musicxml';
    
    if (this.isMidiMode()) return 'musicxml';

    const lesson = this.lessonJson();
    return lesson ? determineControlBarType(lesson, this.moduleType()) : 'video';
  });

  readonly diapoType = computed(() => {
    const lesson = this.lessonJson();
    return lesson ? determineImgType(lesson) : undefined;
  });

  readonly hasAuxiliaryContent = computed(() => {
    const lesson = this.lessonJson();
    if (!lesson) return false;
    // Presence of XML/Score
    if (this.diapoType() === 'xml' || this.xmlUrl()) return true;
    // Presence of Images (loadImg flag)
    if ((lesson as any).loadImg === true || (lesson as any).imageList?.length > 0) return true;
    return false;
  });

  // -- Mode Detection --
  readonly isDirectMode = computed(() => {
    // Si on n'a pas de titre de chapitre ou de navigation, on est forcément en mode Direct
    return !this.chapterTitle() && !this.navigationTitle();
  });

  // -- Unified Metadata Signals --
  
  // 1. Navigation Mode Lines
  readonly navLine1 = computed(() => {
    const num = this.chapter();
    const title = this.chapterTitle() || '';
    if (!title) return '';
    return num !== undefined ? `${num}. ${title}` : title;
  });

  readonly navLine2 = computed(() => {
    const num = this.subChapter();
    const title = this.subChapterTitle() || '';
    if (!title) return '';
    return num !== undefined ? `${num}. ${title}` : title;
  });

  readonly navLine3 = computed(() => {
    const num = this.sequence();
    const title = this.sequenceTitle() || '';
    if (!title) return '';
    return num !== undefined ? `${num}. ${title}` : title;
  });

  readonly dirLine1 = computed(() => this.lessonJson()?.title || '');
  readonly dirLine2 = computed(() => this.lessonJson()?.author || '');
  readonly dirLine3 = computed(() => this.lessonJson()?.infos || '');

  // -- Synchronization Logic --
  readonly syncPoints = computed<Sync[]>(() => {
    const lesson = this.lessonJson();
    if (!lesson) return [];
    
    // Extraction flexible (minuscule ou majuscule)
    const rawSync = (lesson as any).sync || (lesson as any).Sync || (lesson as any).videoSync;
    
    if (rawSync && Array.isArray(rawSync) && rawSync.length > 0) {
        // -- Smart Mapping for Video-XML Sync --
        // If it's a score (XML) but points are in Video format (timeCode/pos)
        const isVideoFormat = 'timeCode' in rawSync[0];
        if (this.diapoType() === 'xml' && isVideoFormat) {
            console.log('[CoreDataService] Mapping VideoSync to MusicXML format...');
            return rawSync.map((p: any, index: number) => {
                const isLast = (index === rawSync.length - 1);
                return {
                    time: p.timeCode,
                    location: { measureIdx: p.pos },
                    type: isLast ? 'end' : (p.timeCode === 0 ? 'start' : 'measure')
                };
            });
        }
        return rawSync;
    }

    return [];
  });

  readonly videoSyncPoints = computed<IVideoSync[]>(() => {
    const lesson = this.lessonJson();
    if (lesson && Array.isArray(lesson.videoSync)) {
        const first = lesson.videoSync[0];
        if (first && typeof first !== 'string' && 'timeCode' in first) {
            return lesson.videoSync as IVideoSync[];
        }
    }
    return [];
  });

  readonly totalTime = computed<number>(() => {
    const lesson = this.lessonJson();
    if (!lesson) return 0;
    
    let total = (lesson as any).totalTime || (lesson as any).duration;
    
    if (!total) {
      const sync = this.syncPoints();
      if (sync.length > 0) {
        const endPoint = sync.find(p => p.type === 'end');
        total = endPoint ? endPoint.time : sync[sync.length - 1].time;
      }
    }
    return total || 0;
  });

  // -- Mutation Methods --
  setLessonData(data: ILesson): void {
    console.log('%c[CoreDataService] STORING DATA:', 'background: #2E7D32; color: white; padding: 2px 5px; border-radius: 2px', data);
    this._lessonJson.set(data);
  }

  setXmlContent(xml: string): void {
    this._xmlContent.set(xml);
  }

  setExercisePayload(payload: any): void {
    this._exercisePayload.set(payload);
  }

  requestSeek(time: number): void {
    this._seekRequest.set({ time, timestamp: Date.now() });
  }

  requestLoopRange(start: number | null, end: number | null, source: string = 'flat'): void {
    this._loopRangeRequest.set({ start, end, source, timestamp: Date.now() });
  }

  clear(): void {
    this._lessonJson.set(null);
    this._xmlContent.set('');
    this._exercisePayload.set(null);
    this._seekRequest.set(null);
    this._loopRangeRequest.set(null);
  }
}
