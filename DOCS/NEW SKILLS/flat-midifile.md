# GESTION DES FICHIERS MUSICXML POUR LE FORMAT MIDI #

## CONTEXTE ##

Je souhaite mettre en place un système de gestion des fichiers musicxml pour le format midi.
Toute la partie gestion est gérer directement par Flat. Il faudra donc s'assurer de l'intégrité des données et de la bonne gestion des fichiers.

## OBJETIF ##

Le but est de pouvoir ajouter une route et lire une partition musicxml.
On pourra jouer la partition et l'élève pourra l'écouter. Idéalement il y aura la possibilité de pouvoir jouer la partition en boucles. 
Il faudra prendre le sdk de flat.io et gérer toutes les fonctionnalités disponible pour refaire la control-bar avec les outils flat.io.

Cette route peut être adresser directment, si nous avons une partition musicxml en paramètre sans rien d'autre. 
ON pourra aussi si nous sommes sur un audiomixer xml ou video xml basculer sur cette route pour lire la partition musicxml. Bien entendu dans ce cas précis il faudra ajouter un switch video/midi pour la route video-score et audio/midi pour l'audiomixer xml.

### Route ###
```typescript
    {
      path: 'score-musicxml',
      data: {},
      loadComponent: () => import('./modules/score-musicxml/score-musicxml.component').then(m => m.ScoreMusicXMLPageComponent),
    }
```

# FLAT SERVICE #

Pour la lecture de la partition musicxml dans le cas de la lecture par flat, il faut que les points de synchronisation ne soient plus présent s'il y en a.
Il n'y aura pas de track associé pour la lecture. 
On devra pouvoir gérer toutes les fonctionnalités depuis la control-bar de flat.io 

On peut d'ores et déjà commencer à regarder le sdk flat.io
https://flat.io/developers/docs/embed/api/playback

# FOnCTIONNALITÉS DU sdk FLAT.IO A UTILISER #
Play / Pause

Gestion des volumes
Pour la gestion des volumes on peut utiliser l'UI de l'audiomixer
Metronome On Off ou metronome mute
Métronome Volume
Master Volume
Track Volume
Track Reverb

Tempo 
Loop
Metronome Count-In

Print
Toogle fullscreen
Zoom In / Zoom Out



