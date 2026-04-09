import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BridgeAction } from '@core/interfaces/bridge.interface';
import {
  hasSyncPoints as checkHasSyncPoints,
  ControlBarType,
  determineControlBarType,
  determineImgType,
  determineModuleType,
  ILesson,
  ImageItem,
  DiapoType,
  LessonModuleType,
  Sync,
  IVideoSync,
  TrackList,
} from '@core/interfaces/lesson.interface';
import { BridgeService } from '@core/services/bridge.service';
import { catchError, map, Observable, Subscription, tap } from 'rxjs';
import { api_url } from '@core/constant/api_url';

@Injectable({
  providedIn: 'root',
})
export class LessonService {
  private _http = inject(HttpClient);
  private _bridgeService = inject(BridgeService);
  private _activatedRoute = inject(ActivatedRoute);
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

  // Computed: Diapo (image) type detection
  readonly diapoType = computed<DiapoType | undefined>(() => {
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
  readonly hasXml = computed(() => this.diapoType() === 'xml');
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
    if (this.diapoType() === 'eps' && lesson.imageList?.length) {
      return lesson.imageList[0].url ?? '';
    }
    // For pdf/xml/html use url directly
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
  readonly videoSyncPoints = computed<IVideoSync[]>(() => {
    const lesson = this.lessonJson();
    if (lesson && Array.isArray(lesson.videoSync) && (lesson.videoSync.length === 0 || 'timeCode' in lesson.videoSync[0])) {
      return lesson.videoSync as IVideoSync[];
    }
    return [];
  });

  readonly measureSyncPoints = computed<Sync[]>(() => {
    const lesson = this.lessonJson();
    if (lesson && Array.isArray(lesson.sync)) {
      return lesson.sync;
    }
    if (lesson && Array.isArray(lesson.videoSync) && (lesson.videoSync.length > 0 && 'location' in (lesson.videoSync[0] as any))) {
      return lesson.videoSync as Sync[];
    }
    return [];
  });

  // Legacy compatibility / general
  readonly syncPoints = computed<(Sync | IVideoSync)[]>(() => {
    const m = this.measureSyncPoints();
    const v = this.videoSyncPoints();
    return m.length > 0 ? m : v;
  });

  // Audio
  readonly audioUrl = computed(() => this.lessonJson()?.audioUrl);

  /**
   * Initialize bridge listener
   */
  constructor() {
    this._bridgeSub = this._bridgeService.message$.subscribe((msg) => {
      if (msg.type === 'lesson' || msg.type === 'init') {
        console.log(
          '[LessonService]: Received lesson data via Bridge =>',
          msg.data,
        );
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

  loadData(handlerName: BridgeAction, moduleName: string): Observable<ILesson> {
    this.isLoading.set(true);
    this.error.set(null);

    return this._bridgeService.getFromFlutter<ILesson>(handlerName).pipe(
      tap((response) => {
        console.log(`[LessonService]:loadData(${handlerName}) =>`, response);
        this.lessonJson.set(response);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        console.warn(
          `[LessonService]:loadData(${handlerName}) failed, falling back to mock data.`,
          err,
        );
        return this.loadTestData(moduleName);
      }),
    );
  }
  loadTestData(moduleName: string): Observable<ILesson> {
    this.isLoading.set(true);
    this.error.set(null);

    // Try to get 'mock' from the current route or the root route
    let mock = this._activatedRoute.snapshot.queryParamMap.get('mock');
    if (!mock) {
      // Fallback: check the global URL if snapshot is not yet ready
      const urlParams = new URLSearchParams(window.location.search);
      mock = urlParams.get('mock');
    }

    const targetSlug = mock || moduleName;
    const url = `assets/test-data/${targetSlug}.json`;

    console.log(`%c[LessonService]: Loading JSON => ${targetSlug}.json`, 'background: #222; color: #bada55; font-size: 14px; padding: 4px;');

    return this._http.get<ILesson>(url).pipe(
      tap((lesson) => {
        console.log(`[LessonService]:loadTestData(${moduleName}) =>`, lesson);
        this.lessonJson.set(lesson);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        console.error(
          `[LessonService]:loadTestData(${moduleName}) => error`,
          err,
        );
        this.error.set(err);
        this.isLoading.set(false);
        throw err;
      }),
    );
  }

  /**
   * Fetch lesson data from API
   */
  fetchLesson(lessonId: string, seq: string): Observable<ILesson> {
    this.isLoading.set(true);
    this.error.set(null);
    this.lessonId.set(lessonId);
    this.seq.set(seq);

    const url = `${api_url.lesson}/${lessonId}/${seq}`;

    return this._http.get<{ datas: ILesson }>(url).pipe(
      map((res) => res.datas),
      tap((lesson) => {
        console.log('[LessonService]:fetchLesson =>', lesson);
        this.lessonJson.set(lesson);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        console.error('[LessonService]:fetchLesson => error', err);
        this.error.set(err);
        this.isLoading.set(false);
        throw err;
      }),
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
   * Returns the child route path: 'video', 'video-diapo', or 'diapo'
   */
  getTargetRoute(): string {
    return this.moduleType();
  }
}
