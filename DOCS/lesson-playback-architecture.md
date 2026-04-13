# 🎼 Architecture de la Route `lesson-playback`

Cette route orchestre la lecture audio multi-pistes, l'affichage de la partition via Flat.io et leur synchronisation réactive.

## 1. Structure de la Route
Dans `app.routes.ts`, la route est configurée pour utiliser le `AudioMixerPageComponent` et charger les données via un `executorResolver`. Le flag `controlBar: 'audiomixer'` dans les métadonnées de la route déclenche l'affichage de la barre de transport premium rouge.

## 2. Services Centraux

| Service | Rôle Technique |
| :--- | :--- |
| **`LessonService`** | Point d'entrée des données JSON. Fournit les `SyncPoints` (points de passage audio/partition). |
| **`AudioService`** | Gère le moteur Web Audio. Notifie les écouteurs de l'évolution du temps via `registerListener()`. |
| **`FlatService`** | Pilote l'embed Flat.io. Implémente `ITimeListener` pour réagir aux tick d'horloge de l'audio. |
| **`ExecutionShell`** | Composant racine qui "branche" physiquement le `FlatService` sur l' `AudioService` lors de l'initialisation de la leçon. |

## 3. Synchronisation Temps Réel

La synchronisation ne se fait pas par polling, mais par **notification réactive** :

1.  **L'Horloge** : `AudioService` utilise `requestAnimationFrame` pour un suivi fluide à 60fps.
2.  **La Notification** : À chaque frame, il appelle `flatService.syncWithAudio(currentTime, isPlaying)`.
3.  **La Logique de Seuil** : 
    *   Si le temps audio franchit le premier point de synchro (ex: **3.39s**), Flat passe en `play()`.
    *   Si l'utilisateur met en pause l'audio, Flat passe en `pause()`.
    *   Si un décalage > 0.1s est détecté, Flat exécute un `seekTrackTo()` pour se caler sur l'audio.

## 4. Gestion de la Boucle (Infinity Loop)

Le système de boucle a été conçu pour être totalement transparent :
1.  L'utilisateur sélectionne des mesures sur Flat.io.
2.  `FlatService` capture l'événement SDK `rangeSelection`.
3.  Il calcule les bornes en secondes et les transmet à `AudioService.setLoopRange(start, end)`.
4.  À la fin de la boucle, l'audio "recircule" instantanément sans couper le contexte Web Audio, assurant une transition inaudible.

## 5. Layout UI

Le Shell d'exécution (`ExecutionShellComponent`) assemble dynamiquement :
*   Le **Contenu** : `AudioMixerPageComponent` (Partition en haut, Mixeur escamotable en bas).
*   Le **Transport** : `AudioMixerControlBarComponentV2` (La barre de contrôle rouge de 80px).

---
*Document généré par l'assistant IA pour l'architecture du projet Modules Content.*
