# PRINCIPE DE BASE POUR LA GESTION DES ROUTES #
De manière générales toutes les modules qui sont créés ont deux modes

Exemples de données :

mode navigation :
                    "chapter": 2,
                    "subChapter": 8,
                    "sequence": 1,
                    "chapterTitle": "Blues mineur",
                    "subChapterTitle": "A vous de jouer",
                    "sequenceTitle": "Playback multipistes"
mode standalone : 
                    "title": "Blues mineur",
                    "subtitle": "Fanou Torracinta",
                    "description": "Gm - Swing Jazz - 12 mesures - 120 bpm"

Le reste des paramètres restent inchangés

# ROUTES EN COURS DE DEVELOPPEMENT #
Vidéo sans partition :
'video'
Vidéo avac partition de type img (eps / pdf)
'video-diapo'
Vidéo avac partition de type xml
'video-score'

Playback multipistes avec partition de type xml
'playback-score'
Playback multipistes avec partition de type img (eps / pdf)
'playback-diapo'

Image simple sans rien
'diapo'
Xml Flat sans audio (utilisé en mode midifile sur les partitions XML)
'music-xml'


# MOCK : EN MODE STANDALONE ON PEUT TESTER AVEC DES JSON EN LOCAL #
http://localhost:4200/video?mock=video
http://localhost:4200/video-diapo?mock=video-img-eps-sync
http://localhost:4200/video-score?mock=video-img-xml-sync

http://localhost:4200/playback-score?mock=lesson_playback_xml

http://localhost:4200/diapo?mock=video-img-xml-sync
http://localhost:4200/music-xml?mock=video-img-xml-sync

/// TEST SANS NAVIGATION
http://localhost:4200/playback-score?mock=lesson_playback_xml_noNav
http://localhost:4200/metronome?mock=metronome

// TODO
http://localhost:4200/playback-diapo?mock=audio-diapo
http://localhost:4200/diapo?mock=diapo-eps
http://localhost:4200/music-xml?mock=flat-musicxml
http://localhost:4200/drummachine?mock=drummachine



