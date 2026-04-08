import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { 
  FlutterToAngularMessage, 
  AngularToFlutterMessage,
  BridgeAction
} from '../interfaces/bridge.interface';

@Injectable({
  providedIn: 'root',
})
export class BridgeService {
  /**
   * Signal to track if we're in the mobile app (Flutter WebView)
   */
  readonly isMobile = signal<boolean>(false);

  /**
   * Observable stream of incoming messages from the native side
   */
  private _messageSubject = new Subject<FlutterToAngularMessage>();
  readonly message$ = this._messageSubject.asObservable();

  constructor() {
    this._detectPlatform();
    this._setupEventListener();
  }

  /**
   * Detects if the current environment is a Flutter InAppWebView
   */
  private _detectPlatform(): void {
    // Check if the flutter_inappwebview object exists (injected by the bridge)
    const isMobile = !!(window as any).flutter_inappwebview;
    this.isMobile.set(isMobile);
    
    if (isMobile) {
      console.log('[BridgeService]: Mobile platform detected (InAppWebView)');
    } else {
      console.log('[BridgeService]: Web platform detected (Standard Browser)');
    }
  }

  /**
   * Sets up the listener for incoming messages based on the platform
   */
  private _setupEventListener(): void {
    // Standard approach for Web (and also common fallback for some WebView implementations)
    window.addEventListener('message', (event: MessageEvent) => {
      if (this._isBridgeMessage(event.data)) {
        console.log('[BridgeService]: Incoming data via postMessage =>', event.data);
        this._messageSubject.next(event.data as FlutterToAngularMessage);
      }
    });

    // InAppWebView specific handlers are typically registered by name. 
    // We expect Flutter to call a global JS function for push notifications.
    (window as any).onFlutterMessage = (data: any) => {
      if (this._isBridgeMessage(data)) {
        console.log('[BridgeService]: Incoming data via onFlutterMessage =>', data);
        this._messageSubject.next(data as FlutterToAngularMessage);
      }
    };
  }

  /**
   * Validates if the data received matches our bridge interface
   */
  private _isBridgeMessage(data: any): boolean {
    return data && typeof data === 'object' && 'type' in data && 'subType' in data;
  }

  /**
   * Sends a message to the native parent (Flutter or Web window)
   */
  sendAction(action: BridgeAction, data?: any): void {
    const message: AngularToFlutterMessage = { action, data };
    
    if (this.isMobile()) {
      // Use InAppWebView JavaScript Handler
      // We assume Flutter has registered a handler named 'onNavigation' or 'onPlayback'
      const handlerName = action === 'next' || action === 'prev' || action === 'goTo' 
        ? 'onNavigation' 
        : 'onPlaybackEvent';

      if ((window as any).flutter_inappwebview?.callHandler) {
        (window as any).flutter_inappwebview.callHandler(handlerName, message);
        console.log(`[BridgeService]: Sent to Flutter [${handlerName}] =>`, message);
      } else {
        console.warn('[BridgeService]: flutter_inappwebview.callHandler is not available yet');
      }
    } else if (window.parent !== window) {
      // Standard postMessage for Web (if we are inside an iframe)
      window.parent.postMessage(message, '*');
      console.log('[BridgeService]: Sent to Parent [postMessage] =>', message);
    } else {
      console.log('[BridgeService]: Standalone mode - Action logged =>', message);
    }
  }
}
