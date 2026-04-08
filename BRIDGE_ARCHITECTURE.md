# Architecture de Communication Bridge (Angular ↔ Flutter)

Ce document détaille l'architecture de communication full-duplex mise en place pour permettre une synchronisation en temps réel entre l'application Angular (contenu des cours) et l'application hôte Flutter (interface mobile).

---

## 1. Vue d'Ensemble

L'objectif est de permettre à Flutter de piloter le contenu Angular (chargement de leçons, initialisation du lecteur) et, inversement, de permettre à Angular de notifier Flutter d'événements de navigation or de lecture (vidéo terminée, bouton "Suivant" cliqué).

```mermaid
graph LR
    Flutter[Flutter App (Dart)] <--> Bridge[Bridge Service (TS)]
    Bridge <--> Angular[Angular Core (LessonService)]
    Angular <--> UI[Modules UI (Video/Img/TAP)]
```

---

## 2. Détection de Plateforme

L'application Angular détecte automatiquement son environnement via le `BridgeService`.

- **Mobile** : Si l'objet `window.flutter_inappwebview` est présent.
- **Web/Iframe** : Si `window.parent !== window`.
- **Standalone** : Si aucun des deux n'est détecté.

```typescript
// Extrait de BridgeService
const isMobile = !!(window as any).flutter_inappwebview;
```

---

## 3. Communication Descendante (Flutter → Angular)

Flutter pousse des données vers Angular pour initialiser ou changer le contenu affiché.

### Mécanisme
On utilise une fonction globale JavaScript `window.onFlutterMessage(data)` que Flutter appelle via `evaluateJavascript`.

### Structure du Message (`FlutterToAngularMessage`)
```typescript
interface FlutterToAngularMessage {
  type: 'init' | 'lesson' | 'playback';
  subType: 'video' | 'tapRythm' | 'midiFile' | 'none';
  data: any; // Le contenu JSON de la leçon
  token: string; // Token d'authentification si nécessaire
}
```

### Exemple d'appel (Console/Flutter)
```javascript
window.onFlutterMessage({
  type: 'lesson',
  subType: 'video',
  data: { lesson: '123', seq: '1', loadVideo: true, jw: 'ID_JWPLAYER' },
  token: 'SECRET_TOKEN'
});
```

---

## 4. Communication Ascendante (Angular → Flutter)

Angular notifie Flutter des actions utilisateur ou de la progression.

### Mécanisme
On utilise les `JavaScriptHandlers` du plugin `flutter_inappwebview`.

### Handlers enregistrés
1.  **`onNavigation`** : Pour les actions de changement de page.
2.  **`onPlaybackEvent`** : Pour les événements liés au lecteur (JW Player, etc.).

### Structure du Message (`AngularToFlutterMessage`)
```typescript
interface AngularToFlutterMessage {
  action: 'next' | 'prev' | 'goTo' | 'finished' | 'progress';
  data?: any;
}
```

### Mapping des Actions
| Action | Handler Flutter | Utilité |
| :--- | :--- | :--- |
| `next` | `onNavigation` | Clic sur "Suivant" dans Angular |
| `prev` | `onNavigation` | Clic sur "Précédent" dans Angular |
| `goTo` | `onNavigation` | Navigation vers une séquence spécifique |
| `finished` | `onPlaybackEvent` | Vidéo ou exercice terminé |
| `progress` | `onPlaybackEvent` | Suivi de progression (temps, score) |

---

## 5. Implémentation Technique (Angular)

### BridgeService (`src/core/services/bridge.service.ts`)
Le service transforme les événements globaux en flux RXJS (`message$`) consommable par le reste de l'application.

```typescript
@Injectable({ providedIn: 'root' })
export class BridgeService {
  private _messageSubject = new Subject<FlutterToAngularMessage>();
  readonly message$ = this._messageSubject.asObservable();

  sendAction(action: BridgeAction, data?: any) {
    const message = { action, data };
    if (this.isMobile()) {
      (window as any).flutter_inappwebview.callHandler(handlerName, message);
    } else {
      window.parent.postMessage(message, '*');
    }
  }
}
```

### LessonService (`src/app/modules/lesson/services/lesson.service.ts`)
Il s'abonne au Bridge pour mettre à jour l'état de l'application via des **Angular Signals**.

```typescript
constructor(private _bridgeService: BridgeService) {
  this._bridgeService.message$.subscribe(msg => {
    if (msg.type === 'lesson') {
      this.lessonJson.set(msg.data); // Déclenche la mise à jour UI
    }
  });
}
```

---

## 6. Guide pour l'implémentation Flutter (Dart)

### Configuration du WebView
```dart
InAppWebView(
  initialOptions: InAppWebViewGroupOptions(
    crossPlatform: InAppWebViewOptions(javaScriptEnabled: true),
  ),
  onWebViewCreated: (controller) {
    // 1. Enregistrement des Handlers
    controller.addJavaScriptHandler(handlerName: 'onNavigation', callback: (args) {
      print("Navigation demandée par Angular: ${args[0]}");
    });
    
    controller.addJavaScriptHandler(handlerName: 'onPlaybackEvent', callback: (args) {
      print("Événement lecture: ${args[0]}");
    });
  },
  onLoadStop: (controller, url) {
    // 2. Injection de la leçon initiale après chargement
    controller.evaluateJavascript(source: "window.onFlutterMessage({...})");
  },
)
```

---

## 7. Débogage et Tests

### Simulation en Console (Navigateur)
Pour tester si le `LessonService` réagit bien sans avoir Flutter :
```javascript
// Simuler la réception d'une leçon
window.postMessage({
  type: 'lesson',
  subType: 'video',
  data: { 
    lesson: 'test-1', 
    seq: '1', 
    loadVideo: true, 
    jw: '6b6tL8x9' 
  } 
  // + token: '...'
}, '*');
```

> [!TIP]
> Tous les logs du Bridge sont préfixés par `[BridgeService]` dans la console pour faciliter le traçage.

> [!WARNING]
> Assurez-vous que le `BridgeService` est injecté tôt (ex: dans `AppComponent`) pour garantir qu'il commence à écouter dès l'initialisation du site.

---

## 8. Implémentation Référence (Code Complet)

### Interfaces ([bridge.interface.ts](file:///Users/ims/Documents/workspace/app/modules_content/src/core/interfaces/bridge.interface.ts))
```typescript
export type BridgeMessageType = 'init' | 'lesson' | 'playback';

export type BridgeSubType = 
  | 'none' 
  | 'video' 
  | 'videoImg' 
  | 'qcm' 
  | 'tapRythm' 
  | 'midiFile' 
  | string;

export interface FlutterToAngularMessage {
  type: BridgeMessageType;
  subType: BridgeSubType;
  data: any;
  token: string;
}

export type BridgeAction = 'next' | 'prev' | 'goTo' | 'finished' | 'progress';

export interface AngularToFlutterMessage {
  action: BridgeAction;
  data?: any;
}
```

### Service de Pont ([bridge.service.ts](file:///Users/ims/Documents/workspace/app/modules_content/src/core/services/bridge.service.ts))
```typescript
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

  private _detectPlatform(): void {
    const isMobile = !!(window as any).flutter_inappwebview;
    this.isMobile.set(isMobile);
  }

  private _setupEventListener(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      if (this._isBridgeMessage(event.data)) {
        this._messageSubject.next(event.data as FlutterToAngularMessage);
      }
    });

    (window as any).onFlutterMessage = (data: any) => {
      if (this._isBridgeMessage(data)) {
        this._messageSubject.next(data as FlutterToAngularMessage);
      }
    };
  }

  private _isBridgeMessage(data: any): boolean {
    return data && typeof data === 'object' && 'type' in data && 'subType' in data;
  }

  sendAction(action: BridgeAction, data?: any): void {
    const message: AngularToFlutterMessage = { action, data };
    
    if (this.isMobile()) {
      const handlerName = action === 'next' || action === 'prev' || action === 'goTo' 
        ? 'onNavigation' 
        : 'onPlaybackEvent';

      if ((window as any).flutter_inappwebview?.callHandler) {
        (window as any).flutter_inappwebview.callHandler(handlerName, message);
      }
    } else if (window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  }
}
```

### Intégration Lesson ([lesson.service.ts](file:///Users/ims/Documents/workspace/app/modules_content/src/app/modules/lesson/services/lesson.service.ts))
```typescript
/**
 * Extrait de l'abonnement dans le constructeur
 */
constructor(private _bridgeService: BridgeService) {
  this._bridgeSub = this._bridgeService.message$.subscribe((msg) => {
    if (msg.type === 'lesson' || msg.type === 'init') {
      console.log('[LessonService]: Received lesson data via Bridge =>', msg.data);
      this.lessonJson.set(msg.data);
      if (msg.data.lesson) this.lessonId.set(msg.data.lesson);
      if (msg.data.seq) this.seq.set(msg.data.seq);
    }
  });
}
```

