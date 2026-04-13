import { computed, Injectable, signal } from '@angular/core';
import { ILesson, Sync, IVideoSync, determineControlBarType, determineModuleType, determineImgType } from '@core/interfaces/lesson.interface';

@Injectable({
  providedIn: 'root',
})
export class CoreDataService {
  // -- Private State (Signals) --
  private readonly _lessonJson = signal<ILesson | null>(null);
  private readonly _xmlContent = signal<string>('');
  private readonly _exercisePayload = signal<any>(null);

  // -- Public Readonly Accessors --
  readonly lessonJson = this._lessonJson.asReadonly();
  readonly xmlContent = this._xmlContent.asReadonly();
  readonly exercisePayload = this._exercisePayload.asReadonly();

  // -- Metadata Computeds --
  readonly chapter = computed(() => this.lessonJson()?.chapter ?? this.lessonJson()?.Chapter);
  readonly sequence = computed(() => this.lessonJson()?.sequence ?? this.lessonJson()?.Sequence);
  readonly chapterTitle = computed(() => this.lessonJson()?.chapterTitle ?? this.lessonJson()?.ChapterTitle);
  readonly subChapterTitle = computed(() => this.lessonJson()?.subChapterTitle ?? this.lessonJson()?.SubChapterTitle);
  readonly sequenceTitle = computed(() => this.lessonJson()?.sequenceTitle ?? this.lessonJson()?.SequenceTitle);
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
  readonly trackList = computed(() => this.lessonJson()?.trackList ?? this.lessonJson()?.TrackList ?? []);

  // -- Module Configuration --
  readonly moduleType = computed(() => {
    const lesson = this.lessonJson();
    return lesson ? determineModuleType(lesson) : 'video';
  });

  readonly controlBarType = computed(() => {
    if (window.location.search.includes('mock=lesson_playback_xml')) return 'audio-mixer';
    const lesson = this.lessonJson();
    return lesson ? determineControlBarType(lesson, this.moduleType()) : 'video';
  });

  readonly diapoType = computed(() => {
    const lesson = this.lessonJson();
    return lesson ? determineImgType(lesson) : undefined;
  });

  // -- Synchronization Logic --
  readonly syncPoints = computed<Sync[]>(() => {
    const lesson = this.lessonJson();
    if (!lesson) return [];
    
    // Extraction flexible (minuscule ou majuscule)
    const rawSync = (lesson as any).sync || (lesson as any).Sync || (lesson as any).videoSync;
    
    if (rawSync && Array.isArray(rawSync) && rawSync.length > 0) {
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

  clear(): void {
    this._lessonJson.set(null);
    this._xmlContent.set('');
    this._exercisePayload.set(null);
  }
}
