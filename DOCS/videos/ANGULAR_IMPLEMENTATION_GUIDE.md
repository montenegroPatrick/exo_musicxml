# Guide d'implémentation Angular - iMusic-School Player

## Vue d'ensemble

Interface de lecteur vidéo moderne pour iMusic-School avec barre de contrôle unifiée intégrant tous les contrôles de lecture et de navigation.

## Architecture des composants

### 1. Composant principal : `VideoPlayerComponent`

```typescript
@Component({
  selector: "app-video-player",
  templateUrl: "./video-player.component.html",
  styleUrls: ["./video-player.component.scss"],
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  // États
  activeTab: "video" | "metronome" = "video";
  isPlaying = false;
  isMuted = false;
  currentTime = 0;
  duration = 0;
  volume = 1;
  showVolumeSlider = false;

  // Référence vidéo
  @ViewChild("videoElement")
  videoElement: ElementRef<HTMLVideoElement>;

  // Données de la leçon (à recevoir via @Input ou service)
  @Input() lessonData: LessonData;
}
```

### 2. Interface de données

```typescript
interface LessonData {
  chapitre: string; // ex: "Chapitre 13 - Accompagnement de chansons"
  sousChapritre: string; // ex: "Set up de l'exemple"
  sequence: string; // ex: "Séquence 1 - Version 1"
  videoUrl: string;
  posterUrl: string;
}
```

## Structure HTML

### Layout principal

```html
<div class="video-player-container">
  <!-- Zone vidéo / métronome -->
  <div class="content-area">
    <video *ngIf="activeTab === 'video'"
           #videoElement
           [src]="lessonData.videoUrl"
           [poster]="lessonData.posterUrl"
           (timeupdate)="handleTimeUpdate($event)"
           (loadedmetadata)="handleLoadedMetadata($event)">
    </video>

    <div *ngIf="activeTab === 'metronome'" class="metronome-container">
      <!-- Interface métronome -->
    </div>
  </div>

  <!-- Barre de contrôle unifiée -->
  <div class="control-bar">
    <!-- Progress bar -->
    <div class="progress-bar-container">
      <input type="range"
             [min]="0"
             [max]="duration"
             [(ngModel)]="currentTime"
             (input)="handleSeek($event)">
      <div class="progress-fill"
           [style.width.%]="(currentTime / duration) * 100"></div>
    </div>

    <!-- Desktop controls -->
    <div class="controls-desktop">
      <!-- Voir structure détaillée ci-dessous -->
    </div>

    <!-- Mobile controls -->
    <div class="controls-mobile">
      <!-- Voir structure détaillée ci-dessous -->
    </div>
  </div>
</div>
```

## Structure des contrôles

### Desktop (md: et plus)

```
┌─────────────────────────────────────────────────────────────────────┐
│ -10s [▶] +10s ⏱ 🔊 │ [◄][►] Chapitre / Sous-chapitre / Séquence │ [📹][🎵] │ ⚙ ⛶ │
└─────────────────────────────────────────────────────────────────────┘
```

**Organisation :**

- **Gauche** : Contrôles de lecture (-10s, Play/Pause, +10s, Temps, Volume)
- **Centre** : Boutons Previous/Next + Titres hiérarchisés
- **Droite** : Switch Vidéo/Métronome, Settings, Fullscreen

### Mobile (< md)

```
┌───────────────────────┐
│ Chapitre              │
│ Séquence              │
├───────────────────────┤
│ [◄][-10s] [▶] [+10s][►]│
├───────────────────────┤
│ ⏱ 00:15/02:39  🔊 ⚙ [📹][🎵]│
└───────────────────────┘
```

**Organisation mobile :**

1. **Top** : Titres (Chapitre + Séquence uniquement)
2. **Middle** : Navigation et contrôles de lecture
3. **Bottom** : Temps, volume, settings, switch

## Styles SCSS

### Variables de couleurs

```scss
// Couleurs principales
$primary-red: #ef4444; // red-500
$primary-red-dark: #dc2626; // red-600
$bg-black: #000000;
$text-white: #ffffff;
$text-white-90: rgba(255, 255, 255, 0.9);
$text-white-80: rgba(255, 255, 255, 0.8);
$text-white-70: rgba(255, 255, 255, 0.7);
$text-white-60: rgba(255, 255, 255, 0.6);
$text-white-50: rgba(255, 255, 255, 0.5);
$white-overlay-5: rgba(255, 255, 255, 0.05);
$white-overlay-10: rgba(255, 255, 255, 0.1);
$white-overlay-15: rgba(255, 255, 255, 0.15);
$white-overlay-20: rgba(255, 255, 255, 0.2);
```

### Barre de contrôle

```scss
.control-bar {
  background: linear-gradient(
    to right,
    $primary-red-dark,
    $primary-red
  );
  position: relative;

  // Animation d'entrée
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Progress bar

```scss
.progress-bar-container {
  position: relative;
  height: 4px;
  background: rgba(139, 0, 0, 0.4); // red-900 avec opacité
  cursor: pointer;

  &:hover .progress-handle {
    opacity: 1;
  }

  input[type="range"] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 10;
  }

  .progress-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    transition: width 0.1s linear;
  }

  .progress-handle {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }
}
```

### Boutons

```scss
// Bouton Play/Pause principal
.play-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: $white-overlay-10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(8px);

  &:hover {
    background: $white-overlay-20;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

// Boutons icônes
.icon-button {
  color: $text-white-90;
  transition: all 0.2s;

  &:hover {
    color: $text-white;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }
}

// Boutons texte (-10s, +10s)
.time-skip-button {
  color: $text-white-80;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: $text-white;
  }
}
```

### Switch Vidéo/Métronome

```scss
.tab-switcher {
  display: flex;
  gap: 4px;
  background: $white-overlay-5;
  border-radius: 8px;
  padding: 2px;

  button {
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s;

    &.active {
      background: $white-overlay-15;
      color: $text-white;
    }

    &:not(.active) {
      color: $text-white-60;

      &:hover {
        color: $text-white-90;
      }
    }
  }
}
```

### Titres hiérarchisés

```scss
.lesson-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  flex: 1;

  .chapitre {
    color: $text-white-50;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sous-chapitre {
    color: $text-white-70;
    font-size: 12px;
    margin-top: 2px;
  }

  .sequence {
    color: $text-white;
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
```

### Responsive (Mobile)

```scss
// Breakpoint mobile
$breakpoint-md: 768px;

.controls-desktop {
  display: flex;

  @media (max-width: $breakpoint-md - 1) {
    display: none;
  }
}

.controls-mobile {
  display: none;

  @media (max-width: $breakpoint-md - 1) {
    display: block;
  }
}

// Mobile : Bouton Play plus grand
@media (max-width: $breakpoint-md - 1) {
  .play-button {
    width: 56px;
    height: 56px;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  // Titres mobile : masquer le sous-chapitre
  .lesson-info .sous-chapitre {
    display: none;
  }
}
```

### Slider de volume

```scss
.volume-control {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;

  .volume-slider {
    width: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.2s;

    &.show {
      width: 80px;
      opacity: 1;
    }

    input[type="range"] {
      width: 80px;
      accent-color: white;
    }
  }
}
```

## Fonctions TypeScript

### Gestion de la lecture

```typescript
handlePlayPause(): void {
  const video = this.videoElement.nativeElement;
  if (this.isPlaying) {
    video.pause();
  } else {
    video.play();
  }
  this.isPlaying = !this.isPlaying;
}

handleSkipBack(): void {
  const video = this.videoElement.nativeElement;
  video.currentTime = Math.max(0, video.currentTime - 10);
}

handleSkipForward(): void {
  const video = this.videoElement.nativeElement;
  video.currentTime = Math.min(this.duration, video.currentTime + 10);
}

handleSeek(event: Event): void {
  const input = event.target as HTMLInputElement;
  const newTime = parseFloat(input.value);
  this.currentTime = newTime;
  this.videoElement.nativeElement.currentTime = newTime;
}
```

### Gestion du volume

```typescript
handleMuteToggle(): void {
  const video = this.videoElement.nativeElement;
  video.muted = !this.isMuted;
  this.isMuted = !this.isMuted;
}

handleVolumeChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const newVolume = parseFloat(input.value);
  this.volume = newVolume;
  const video = this.videoElement.nativeElement;
  video.volume = newVolume;

  if (newVolume === 0) {
    this.isMuted = true;
  } else if (this.isMuted) {
    this.isMuted = false;
  }
}
```

### Utilitaires

```typescript
formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

handleTimeUpdate(event: Event): void {
  const video = event.target as HTMLVideoElement;
  this.currentTime = video.currentTime;
}

handleLoadedMetadata(event: Event): void {
  const video = event.target as HTMLVideoElement;
  this.duration = video.duration;
}
```

### Navigation entre séquences

```typescript
goToPreviousSequence(): void {
  // Logique pour charger la séquence précédente
  // À implémenter selon votre système de navigation
}

goToNextSequence(): void {
  // Logique pour charger la séquence suivante
  // À implémenter selon votre système de navigation
}
```

## Icônes

Utiliser une bibliothèque d'icônes Angular comme **Angular Material Icons** ou **Lucide Angular**.

### Icônes nécessaires :

- `Play` (lecture)
- `Pause` (pause)
- `SkipBack` (précédent)
- `SkipForward` (suivant)
- `Volume2` (volume actif)
- `VolumeX` (volume muet)
- `Clock` (horloge)
- `Settings` (paramètres)
- `Maximize` (plein écran)
- `Video` (icône vidéo)
- `Music2` (icône métronome)

## Animations

### Utiliser Angular Animations

```typescript
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
```

## Points d'attention

### 1. Performance

- Utiliser `ChangeDetectionStrategy.OnPush` pour optimiser les performances
- Débouncer les événements `timeupdate` si nécessaire
- Lazy-load le composant métronome

### 2. Accessibilité

- Tous les boutons ont des `aria-label`
- Support clavier complet (Espace pour play/pause, flèches pour navigation)
- Contraste suffisant sur tous les textes

### 3. Mobile

- Remplacer `hover` par `active` sur mobile
- Taille des zones de touch >= 44x44px
- Désactiver le slider de volume sur mobile (gestion système)

### 4. États de chargement

- Afficher un spinner pendant le chargement de la vidéo
- Désactiver les contrôles tant que la vidéo n'est pas prête
- Gérer les erreurs de chargement

### 5. Fullscreen

```typescript
toggleFullscreen(): void {
  const container = this.videoPlayerContainer.nativeElement;

  if (!document.fullscreenElement) {
    container.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
```

## Module Angular requis

```typescript
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
  declarations: [VideoPlayerComponent],
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    // Votre bibliothèque d'icônes
  ],
  exports: [VideoPlayerComponent],
})
export class VideoPlayerModule {}
```

## Intégration Antigravity

Si vous utilisez Antigravity pour la génération de code :

### Prompt recommandé :

```
Créer un composant Angular VideoPlayerComponent pour un lecteur vidéo éducatif avec :

1. Barre de contrôle rouge gradient unifiée (red-600 à red-500)
2. Layout responsive (desktop : Gauche = contrôles lecture, Centre = navigation & titres, Droite = switch & settings | mobile 3 lignes)
3. Contrôles : -10s/+10s, Play/Pause, Previous/Next séquence, Volume, Settings, Fullscreen
4. Switch Vidéo/Métronome avec icônes uniquement (à droite sur desktop)
5. 3 niveaux de titres centrés : Chapitre (gris clair) / Sous-chapitre (gris moyen) / Séquence (blanc)
6. Progress bar interactive avec handle au hover
7. Animation d'entrée slideUp sur la barre de contrôle
8. Support mobile avec layout adapté

Styles : fond noir, textes blancs avec opacités variées, boutons avec hover/active states.
```

## Checklist de validation

- [ ] Lecture/pause fonctionne
- [ ] Progress bar cliquable et draggable
- [ ] Boutons -10s / +10s fonctionnels
- [ ] Navigation Previous/Next implémentée
- [ ] Volume slider apparaît au hover (desktop)
- [ ] Switch Vidéo/Métronome change le contenu
- [ ] Titres hiérarchisés affichés correctement
- [ ] Responsive mobile fonctionnel
- [ ] Animation slideUp visible au chargement
- [ ] Accessibilité : aria-labels, support clavier
- [ ] Performance : pas de lag sur timeupdate
- [ ] Fullscreen fonctionne

---

**Date de création** : 2026-04-08
**Version React de référence** : Voir `src/app/App.tsx`