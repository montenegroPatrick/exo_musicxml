import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, effect, untracked, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BridgeAction } from '@core/interfaces/bridge.interface';
import { ILesson, determineImgType } from '@core/interfaces/lesson.interface';
import { BridgeService } from '@core/services/bridge.service';
import { CoreDataService } from '@core/services/core-data.service';
import { catchError, map, Observable, tap } from 'rxjs';
import { api_url } from '@core/constant/api_url';

@Injectable({
  providedIn: 'root',
})
export class LessonService {
  private _http = inject(HttpClient);
  private _bridgeService = inject(BridgeService);
  private _coreDataStore = inject(CoreDataService);

  // -- Local State (Identifiers) --
  private readonly _lessonId = signal<string>('');
  private readonly _seq = signal<string>('');
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<Error | null>(null);
  
  // -- Mode Check --
  private readonly _isMockMode = computed(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return !!urlParams.get('mock');
  });

  // -- Reactive Interop with Bridge --
  private _bridgeMsg = toSignal(this._bridgeService.message$, { initialValue: null });

  // -- Source of Truth Accessors (Proxied to CoreDataService) --
  readonly lessonJson = this._coreDataStore.lessonJson;
  readonly lessonId = this._lessonId.asReadonly();
  readonly seq = this._seq.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // -- Computed metadata Proxies --
  readonly chapter = this._coreDataStore.chapter;
  readonly sequence = this._coreDataStore.sequence;
  readonly chapterTitle = this._coreDataStore.chapterTitle;
  readonly subChapterTitle = this._coreDataStore.subChapterTitle;
  readonly sequenceTitle = this._coreDataStore.sequenceTitle;
  readonly courseTitle = this._coreDataStore.courseTitle;
  readonly navigationTitle = this._coreDataStore.navigationTitle;
  
  readonly titre = this._coreDataStore.titre;
  readonly compositeur = this._coreDataStore.compositeur;
  readonly producteur = this._coreDataStore.producteur;
  readonly videoSyncPoints = this._coreDataStore.videoSyncPoints;

  readonly moduleType = this._coreDataStore.moduleType;
  readonly controlBarType = this._coreDataStore.controlBarType;
  readonly diapoType = this._coreDataStore.diapoType;
  
  // -- Media Proxies --
  readonly jwPlayerId = this._coreDataStore.jwPlayerId;
  readonly youtubeId = this._coreDataStore.youtubeId;
  readonly vimeoId = this._coreDataStore.vimeoId;
  readonly xmlUrl = this._coreDataStore.xmlUrl;

  private readonly _messageEffect = effect(() => {
    const isMock = this._isMockMode();
    if (isMock) return; // Prevent bridge from overriding mock data

    const msg = this._bridgeMsg();
    if (msg) {
      // -- Bridge Message Filtering --
      // Only treat message as a lesson if it contains at least one characteristic property
      const keys = Object.keys(msg);
      const matchingKey = [
        'chapter', 'Chapter', 
        'sync', 'Sync', 
        'url', 
        'chapterTitle', 'ChapterTitle', 
        'videoSync', 
        'trackList', 'TrackList', 
        'folder', 'Folder',
        'imageList', 'ImageList'
      ].find(k => keys.includes(k));
      
      if (matchingKey) {
          console.log(`[LessonService] Bridge message identifies as a Lesson (via key: ${matchingKey}). Updating state...`);
          untracked(() => this.setLessonData(msg as unknown as ILesson));
      } else {
          console.log('%c[LessonService] Technical bridge message ignored:', 'color: #EF6C00; font-style: italic', keys);
      }
    }
  });

  constructor() {}

  loadData(handlerName: BridgeAction, moduleName: string): Observable<ILesson> {
    this._isLoading.set(true);
    if (!this._bridgeService.isMobile() && !this._bridgeService.isFlutterWeb()) {
      return this.loadTestData(moduleName);
    }
    return this._bridgeService.getFromFlutter<ILesson>(handlerName).pipe(
      tap((lesson) => {
        this.setLessonData(lesson);
        this._isLoading.set(false);
      }),
      catchError(() => this.loadTestData(moduleName))
    );
  }

  loadTestData(moduleName: string): Observable<ILesson> {
    this._isLoading.set(true);
    const urlParams = new URLSearchParams(window.location.search);
    const mock = urlParams.get('mock');
    const targetSlug = mock || moduleName;
    const url = `assets/test-data/${targetSlug}.json`;

    return this._http.get<ILesson>(url).pipe(
      tap((lesson) => {
        this.setLessonData(lesson);
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._error.set(err);
        this._isLoading.set(false);
        throw err;
      })
    );
  }

  setLessonData(data: ILesson): void {
    console.log('%c[LessonService] RECEIVING DATA:', 'background: #0277BD; color: white; padding: 2px 5px; border-radius: 2px', data);
    this._coreDataStore.setLessonData(data);
    if (data.chapter !== undefined) this._lessonId.set(data.chapter.toString());
    if (data.sequence !== undefined) this._seq.set(data.sequence.toString());

    // -- Reactive XML Loading --
    if (data.url && (this.diapoType() === 'xml' || data.typeImg === 'xml')) {
        console.log('[LessonService] Detected XML lesson, fetching file...');
        this._http.get(data.url, { responseType: 'text' }).subscribe({
            next: (xml) => {
                console.log('[LessonService] XML file loaded successfully');
                this._coreDataStore.setXmlContent(xml);
            },
            error: (err) => console.error('[LessonService] XML fetch error:', err)
        });
    }
  }

  clearLesson(): void {
    this._coreDataStore.clear();
    this._lessonId.set('');
    this._seq.set('');
    this._isLoading.set(false);
  }
}
