import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, first, from, Observable, tap } from 'rxjs';
import {
  AngularToFlutterMessage,
  BridgeAction,
} from '../interfaces/bridge.interface';

const HANDLER_MAP: Partial<Record<BridgeAction, string>> = {
  next: 'next',
  prev: 'previous',
  goTo: 'onNavigation',
  init: 'getInitialData',
};

@Injectable({
  providedIn: 'root',
})
export class BridgeService {
  private readonly _destroyRef = inject(DestroyRef);

  // --- Platform detection (readonly, set once at init) ---
  readonly isMobile = signal<boolean>(false);
  readonly isFlutterWeb = signal<boolean>(false);
  readonly platform = computed<'mobile' | 'flutter-web' | 'standalone'>(() => {
    if (this.isMobile()) return 'mobile';
    if (this.isFlutterWeb()) return 'flutter-web';
    return 'standalone';
  });

  // --- Incoming messages ---
  readonly lastMessage = signal<Record<string, unknown> | null>(null);
  readonly message$ = toObservable(this.lastMessage).pipe(
    filter((msg): msg is Record<string, unknown> => msg !== null),
  );

  constructor() {
    this._detectPlatform();
    this._setupEventListener();
  }

  // ---------------------------------------------------------------------------

  private _detectPlatform(): void {
    const isMobile = !!(window as any).flutter_inappwebview;
    this.isMobile.set(isMobile);

    if (isMobile) {
      // console.log('[BridgeService]: Mobile platform detected (InAppWebView)');
      return;
    }

    const isFlutterWeb =
      window.parent !== window &&
      new URLSearchParams(window.location.search).get('platform') === 'web';
    this.isFlutterWeb.set(isFlutterWeb);

    // console.log(`[BridgeService]: ${isFlutterWeb ? 'Flutter Web' : 'Standalone'} platform detected`);
  }

  private _setupEventListener(): void {
    const fromPostMessage = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (this._isBridgeMessage(data)) {
        // console.log('[BridgeService]: postMessage =>', data);
        this._push(data as Record<string, unknown>);
      }
    };

    window.addEventListener('message', fromPostMessage);
    this._destroyRef.onDestroy(() =>
      window.removeEventListener('message', fromPostMessage),
    );

    (window as any).onFlutterMessage = (data: any) => {
      if (this._isBridgeMessage(data)) {
        // console.log('[BridgeService]: onFlutterMessage =>', data);
        this._push(data as Record<string, unknown>);
      }
    };
  }

  private _push(msg: Record<string, unknown>): void {
    this.lastMessage.set(msg);
  }

  private _isBridgeMessage(data: any): boolean {
    return data;
  }

  // ---------------------------------------------------------------------------

  getFromFlutter<T>(
    handlerName: BridgeAction,
  ): Observable<Record<string, unknown>> {
    if (this.isMobile()) {
      return from(
        (window as any).flutter_inappwebview.callHandler(
          handlerName,
        ) as Promise<Record<string, unknown>>,
      );
    }

    // Flutter Web: trigger a request then wait for the response
    const requestId = crypto.randomUUID();
    window.parent.postMessage(
      JSON.stringify({ type: 'init', subType: 'none', requestId }),
      '*',
    );
    // console.log(`[BridgeService]: Flutter Web - requested [${handlerName}] requestId=${requestId}`);

    return this.message$.pipe(
      filter((msg) => msg['requestId'] === requestId),
      first(),
      tap((data) =>
        console.log(`[BridgeService]: Flutter Web - response [${handlerName}] =>`, data,),
      ),
      takeUntilDestroyed(this._destroyRef),
    );
  }

  sendAction(action: BridgeAction, data?: any): void {
    const message: AngularToFlutterMessage = { action, data };

    switch (this.platform()) {
      case 'mobile': {
        const handlerName = HANDLER_MAP[action] ?? 'onPlaybackEvent';
        if ((window as any).flutter_inappwebview?.callHandler) {
          (window as any).flutter_inappwebview.callHandler(
            handlerName,
            message,
          );
          // console.log(`[BridgeService]: Mobile => [${handlerName}]`, message);
        } else {
          console.warn('[BridgeService]: callHandler not available yet');
        }
        break;
      }
      case 'flutter-web': {
        const requestId = crypto.randomUUID();
        window.parent.postMessage(
          JSON.stringify({ ...message, requestId }),
          '*',
        );
        // console.log('[BridgeService]: Flutter Web => postMessage', { ...message, requestId });
        break;
      }
      default:
        if (window.parent !== window) {
          window.parent.postMessage(JSON.stringify(message), '*');
        } else {
          // console.log('[BridgeService]: Standalone => action logged', message);
        }
    }
  }
}
