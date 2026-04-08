import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { api_url } from '@core/constant/api_url';
import {
  ILesson,
  ImgType,
  LessonModuleType,
  ControlBarType,
  Sync,
  ImageItem,
  TrackList,
  determineModuleType,
  determineImgType,
  determineControlBarType,
  hasSyncPoints as checkHasSyncPoints,
} from '@core/interfaces/lesson.interface';
import { map, Observable, tap, catchError, of, Subscription } from 'rxjs';
import { BridgeService } from '@core/services/bridge.service';

@Injectable({
  providedIn: 'root',
})
export class LessonService {
  private _http = inject(HttpClient);
  private _bridgeService = inject(BridgeService);
  private _bridgeSub?: Subscription;

  // Core signals
  readonly lessonJson = signal<ILesson | null>(null);
  readonly lessonId = signal<string>('');
  readonly seq = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<Error | null>(null);

  // New metadata signals
  readonly chapter = computed(() => this.lessonJson()?.Chapter);
  readonly subChapter = computed(() => this.lessonJson()?.SubChapter);
  readonly sequence = computed(() => this.lessonJson()?.Sequence);
  readonly chapterTitle = computed(() => this.lessonJson()?.ChapterTitle);
  readonly subChapterTitle = computed(() => this.lessonJson()?.SubChapterTitle);
  readonly sequenceTitle = computed(() => this.lessonJson()?.SequenceTitle);

  // Computed: Module type detection
  readonly moduleType = computed<LessonModuleType>(() => {
    const lesson = this.lessonJson();
    if (!lesson) return 'video';
    return determineModuleType(lesson);
  });

  // Computed: Image type detection
  readonly imgType = computed<ImgType | undefined>(() => {
    const lesson = this.lessonJson();
    if (!lesson) return undefined;
    return determineImgType(lesson);
  });

  // Computed: Control bar type
  readonly controlBarType = computed<ControlBarType>(() => {
    const lesson = this.lessonJson();
    if (!lesson) return 'video';
    return determineControlBarType(lesson, this.moduleType());
  });

  // Computed: Helper flags
  readonly hasVideo = computed(() => this.lessonJson()?.loadVideo === true);
  readonly hasAudio = computed(() => this.lessonJson()?.loadAudio === true);
  readonly hasImg = computed(() => this.lessonJson()?.loadImg === true);
  readonly hasXml = computed(() => this.imgType() === 'xml');
  readonly hasSyncPoints = computed(() => {
    const lesson = this.lessonJson();
    if (!lesson) return false;
    return checkHasSyncPoints(lesson);
  });

  // Computed: Specific properties
  readonly jwPlayerId = computed(() => this.lessonJson()?.jw ?? '');
  readonly videoName = computed(() => this.lessonJson()?.videoName);
  readonly subtitles = computed(() => this.lessonJson()?.subtitles ?? []);

  readonly imageList = computed<ImageItem[]>(
    () => this.lessonJson()?.imageList ?? [],
  );
  readonly currentImgUrl = computed(() => {
    const lesson = this.lessonJson();
    if (!lesson) return '';

    // For eps, use first image from imageList
    if (this.imgType() === 'eps' && lesson.imageList?.length) {
      return lesson.imageList[0].url ?? '';
    }
    // For pdf/xml use url directly
    return lesson.url ?? '';
  });

  readonly printable = computed(() => this.lessonJson()?.printable ?? false);
  readonly printExt = computed(() => this.lessonJson()?.printExt);

  // XML specific
  readonly trackList = computed<TrackList[]>(
    () => this.lessonJson()?.trackList ?? [],
  );
  readonly xmlUrl = computed(() => this.lessonJson()?.url ?? '');
  readonly folder = computed(() => this.lessonJson()?.folder);

  // Sync points
  readonly syncPoints = computed<Sync[]>(() => {
    const lesson = this.lessonJson();
    if (!lesson) return [];

    // video-img uses videoSync
    if (Array.isArray(lesson.videoSync)) {
      return lesson.videoSync;
    }
    // img uses sync
    if (Array.isArray(lesson.sync)) {
      return lesson.sync;
    }
    return [];
  });

  // Audio
  readonly audioUrl = computed(() => this.lessonJson()?.audioUrl);

  /**
   * Initialize bridge listener
   */
  constructor() {
    this._bridgeSub = this._bridgeService.message$.subscribe((msg) => {
      if (msg.type === 'lesson' || msg.type === 'init') {
        console.log('[LessonService]: Received lesson data via Bridge =>', msg.data);
        this.lessonJson.set(msg.data);
        // Extract lessonId and seq if available in data or pass them separately
        if (msg.data.lesson) this.lessonId.set(msg.data.lesson);
        if (msg.data.seq) this.seq.set(msg.data.seq);
      }
    });
  }

  ngOnDestroy(): void {
    this._bridgeSub?.unsubscribe();
  }

  /**
   * Load test data from local assets/test-data folder
   */
  loadTestData(moduleName: string): Observable<ILesson> {
    this.isLoading.set(true);
    this.error.set(null);
    
    const url = `assets/test-data/${moduleName}.json`;
    
    return this._http.get<ILesson>(url).pipe(
      tap((lesson) => {
        console.log(`[LessonService]:loadTestData(${moduleName}) =>`, lesson);
        this.lessonJson.set(lesson);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        console.error(`[LessonService]:loadTestData(${moduleName}) => error`, err);
        this.error.set(err);
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  /**
   * Directly inject lesson data (useful for Bridge)
   */
  setLessonData(data: ILesson): void {
    console.log('[LessonService]:setLessonData =>', data);
    this.lessonJson.set(data);
    if (data.Chapter !== undefined) this.lessonId.set(data.Chapter.toString());
    if (data.Sequence !== undefined) this.seq.set(data.Sequence.toString());
  }

  /**
   * Clear lesson data
   */
  clearLesson(): void {
    this.lessonJson.set(null);
    this.lessonId.set('');
    this.seq.set('');
    this.isLoading.set(false);
    this.error.set(null);
  }

  /**
   * Get target route segment based on module type
   * Returns the child route path: 'video', 'video-img', or 'img'
   */
  getTargetRoute(): string {
    return this.moduleType();
  }
}
