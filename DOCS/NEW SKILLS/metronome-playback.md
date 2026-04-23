# New Skills : Gestion du mode "Audio playback" / "metronome-playback" sur les leçons de type diapo PDF/EPS

## Contexte / Objectif

Dans ce cadre l'élève regarde une vidéo d'explication avec la partition PDF ou EPS. 
Cette partition doit être maitriser pour passer à la suite.
C'est pourquoi l'on propose un mode "Audio playback" / "metronome-playback" qui permet à l'élève de s'exercer sur la partition.

Il y a deux cas:
1. Il n'y a pas de mp3 associer et du coup on a un switch video/métronome.
2. Il y a un mp3 associer. Dans ce cas on a un switch vidéo/mp3 et on a la possibilité d'avoir le playback audio.

L'objectif est donc de mettre en place ces deux cas sur la route "video-diapo".

## Comment mettre en place?
Sois on créé deux nouvelles routes "metronome-diapo" et "playback-diapo" qui prendront en paramètre le fichier json de la leçon.
Soit on modifie la route "video-diapo" pour qu'elle prenne en paramètre le fichier json de la leçon.

Pour la partie audio-mp3, il faudra partir sur l'exemple de la leçon json "video-img-audio.json"

On peut remarquer sur le fichier json qu'il y a un  "loadAudio"= true
Et pour l'audio-mp3, on a l'url dans "audioUrl" = ""
Il faudra l'activer pour que l'audio soit chargé.

Pour le métronome, il faudra partir sur l'exemple de la leçon json "video-diapo.json"
On peut remarquer sur le fichier json qu'il y a un "loadAudio"= false
Et du coup il n'y a pas d'url.

-------------------------------------------
On parle uniquement des cas video-diapo


Je préconise de créer deux nouvelles routes:
1. "metronome-diapo" qui prendra en paramètre le fichier json de la leçon.
2. "playback-diapo" qui prendra en paramètre le fichier json de la leçon.

Dans le cas 1 ( pas de mp3)
Ajouter le switch Video - Métronome sur les routes "video-diapo" et "metronome-diapo"
Quand on est sur la route "video-diapo", on affiche la vidéo dans la control-bar on a le switch Video - Métronome si on clique sur métronome on passe sur la route "metronome-diapo" avec le métronome dans la control-bar on a le switch video - métronome avec métronome sélectionné si on clique sur vidéo on revient sur la route "video-diapo" avec la vidéo dans la control-bar on a le switch video - métronome avec vidéo sélectionné.

Dans le cas 2 ( il y a un mp3)
Ajouter le switch Video - MP3 sur les routes "video-diapo" et "playback-diapo"
Quand on est sur la route "video-diapo", on affiche la vidéo dans la control-bar on a le switch Video - MP3 si on clique sur playback on passe sur la route "playback-diapo" avec le playback dans la control-bar on a le switch video - playback avec playback sélectionné si on clique sur vidéo on revient sur la route "video-diapo" avec la vidéo dans la control-bar on a le switch video - playback avec vidéo sélectionné.

Ces deux nouvelles routes pourront être appeler depuis un autre module et sans vidéo.
Si il n'y a pas de vidéo, il n'y aura pas de switch video/métronome ou video/mp3. 

Dans le cas du métronome il faudrait une control-bar spécifique ou on redistribue les éléments du métronome présent sur la route metronome (play/pause/stop, volume, tempo, indications visuelles de temps). Sélection des options Accentuer le premier temps. Division en croche etc..  , mode training avec augmentation progressive du tempo. On garde les même icônes (pi pi-play-circle, pi pi-pause-circle, pi pi-stop-circle, pi pi-volume-high, pi pi-sliders-h, pi pi-list-music, pi pi-check-circle, pi pi-list, pi pi-play-circle) et la même logique que sur la route metronome.

