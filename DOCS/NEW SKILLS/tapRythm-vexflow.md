# PRINCIPE DE MISE A NIVEAU DE L EXERCICE TAP RYTHM #
Je décris l'exercice actueel développer en Angularjs en vue de l'optimiser et le mettre à niveau dans la nouvelle application.

A noter : j'ai développé une autre forme d'exerice de rythme dans cette application. Il faudra l'isoler et ne pas le touché pour le moment.
    {
            path: 'tap-rythm',
            data: { },
            loadComponent: () => import('./modules/tap-rythm/tap-rythm.component').then(m => m.TapRythmPageComponent),
    }

# Description de l'exercice actuel en AngulaJS #
Pour des raisons technique de convenance, l'exercice est basé sur l'api vexflow.
C'est un exercice de rythme du coup il faudra avoir un métronome.

L'élève clique sur "Commencer", il a une mesure de décompte ét ensuite il effectue l'exercice de rythme. A la fin de l'exercice le résultat sera analysé et affiché.

Un système de notation est en place, il pourra être optimiser. 
La zone de tap a été optimisé pour la sensibilité au niveau mobile.
Il faudra tenir compte de cela pour que l'utilisateur n'ai pas de latence entre le tap et le résultat.

L'affichage de la partition doit être vertical en mode rythme avec une seule ligne, tu pourras récupérer le modèle sur l'application angularjs.

Un système de transcription pour les données a été mis en place
            {
                "noteErrorMarge": "dc",
                "mesureDivision": "44",
                "id": "bise_10",
                "title": "Exercice : taper le rythme",
                "tempo": "60",
                "mesureSize": "150",
                "mesureList": ["s,n,n,s", "n,n,s,n", "n,n,dp", "n,dp,n"]
            };

# COMPOSANT ANGULARJS #

/app/web/src/module/exoTapRythm/

# MISE EN PLACE #

Le but est de mettre à jour et opitmiser l'exercice au niveau UI.

CONTROL-BAR
Il faut garder une control-bar visuellement identique à la control-bar vidéo.
Il faut garder la même approche, avec et sans navigation.
Dans le dossier /assets/test-data il y a deux json d'applicztions :
    - tapRythmVexFlowNav.json
    - tapRythmVexFlowNoNav.json

Dans la barre on pourra régler le niveau de difficulté avec 3 niveaux.
Au centre on garde le bouton play avec gestion du volume du métronome.

Pour l'exercice il faut garder le même fonctionnement.
Adapter la partition à la taille de l'écran. Le but étant que l'élève puisse voir au minimum la mesure en cours ainsi que la mesure ou une partie de la mesure suivante.
 