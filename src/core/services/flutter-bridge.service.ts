import { Injectable } from '@angular/core';

// flutter-bridge.service.ts
@Injectable({ providedIn: 'root' })
export class FlutterBridgeService {
  private ready = false;

  constructor() {
    this.waitForBridge();
  }

  private waitForBridge(): void {
    window.addEventListener('flutter-ready', () => {
      this.ready = true;
      console.log('Flutter bridge prêt ✅');
    });
  }

  async callFlutter<T = any>(handlerName: string, ...args: any[]): Promise<T> {
    if (!this.ready) {
      await this.waitUntilReady();
    }
    return (window as any).flutter_inappwebview.callHandler(
      handlerName,
      ...args,
    );
  }

  private waitUntilReady(): Promise<void> {
    return new Promise((resolve) => {
      window.addEventListener('flutter-ready', () => resolve(), { once: true });
    });
  }

  on(action: string, callback: (payload: any) => void): void {
    window.addEventListener('flutter-event', (event: any) => {
      if (event.detail.action === action) {
        callback(event.detail.payload);
      }
    });
  }
}
