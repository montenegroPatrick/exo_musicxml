# Intégration avec l'application AngularJS parente

Ce document explique comment intégrer l'application Angular 19 (exo_musicxml) dans une application AngularJS en tant qu'iframe et écouter les événements émis.

## Événements émis par l'iframe

L'application Angular 19 émet des événements via `postMessage` au format suivant :

```javascript
{
  eventName: 'sequence-change',
  data: {
    currentSequence: '7',
    nextSequence: '8',
    results: {
      percentage: 85,
      totalNotes: 20,
      totalTaps: 20,
      goodTaps: 17,
      lateTaps: 2,
      earlyTaps: 1,
      tooLateTaps: 0,
      tooEarlyTaps: 0,
      missedTaps: 0,
      level: 1.2
    },
    timestamp: 1234567890123
  }
}
```

## Code AngularJS pour écouter les événements

### Option 1 : Dans un contrôleur AngularJS

```javascript
angular.module('votre-app').controller('VotreController', [
  '$scope',
  '$rootScope',
  '$window',
  function($scope, $rootScope, $window) {

    // Fonction de gestion des messages postMessage
    function handleMessage(event) {
      // IMPORTANT : Vérifier l'origine pour la sécurité
      // Remplacez par l'origine réelle de votre iframe
      // const allowedOrigin = 'http://localhost:4200';
      // if (event.origin !== allowedOrigin) {
      //   console.warn('Message reçu d\'une origine non autorisée:', event.origin);
      //   return;
      // }

      const message = event.data;

      // Vérifier que le message a la structure attendue
      if (message && message.eventName) {
        console.log('Message reçu de l\'iframe:', message);

        // Convertir en $broadcast AngularJS
        $rootScope.$broadcast(message.eventName, message.data);

        // Forcer la détection de changements AngularJS
        $scope.$apply();
      }
    }

    // Ajouter le listener au chargement
    $window.addEventListener('message', handleMessage, false);

    // Nettoyer le listener à la destruction du scope
    $scope.$on('$destroy', function() {
      $window.removeEventListener('message', handleMessage);
    });

    // Écouter l'événement de changement de séquence
    $scope.$on('sequence-change', function(event, data) {
      console.log('Changement de séquence reçu:', data);

      // Traiter les données
      const currentSeq = data.currentSequence;
      const nextSeq = data.nextSequence;
      const results = data.results;

      console.log(`Séquence actuelle: ${currentSeq}`);
      console.log(`Prochaine séquence: ${nextSeq}`);
      console.log(`Score: ${results.percentage}%`);
      console.log(`Niveau: ${results.level}`);

      // VOTRE LOGIQUE ICI
      // Par exemple : charger la prochaine séquence
      // loadNextSequence(nextSeq);

      // Ou sauvegarder les résultats
      // saveResults(currentSeq, results);
    });
  }
]);
```

### Option 2 : Dans un service AngularJS (recommandé)

```javascript
angular.module('votre-app').factory('IframeMessageService', [
  '$rootScope',
  '$window',
  function($rootScope, $window) {

    function handleMessage(event) {
      // IMPORTANT : Vérifier l'origine pour la sécurité
      // const allowedOrigin = 'http://localhost:4200';
      // if (event.origin !== allowedOrigin) {
      //   console.warn('Message reçu d\'une origine non autorisée:', event.origin);
      //   return;
      // }

      const message = event.data;

      if (message && message.eventName) {
        console.log('Message reçu de l\'iframe:', message);

        // Convertir en $broadcast AngularJS
        $rootScope.$broadcast(message.eventName, message.data);

        // Forcer la mise à jour
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      }
    }

    // Initialiser le listener
    function init() {
      $window.addEventListener('message', handleMessage, false);
    }

    // Nettoyer
    function destroy() {
      $window.removeEventListener('message', handleMessage);
    }

    return {
      init: init,
      destroy: destroy
    };
  }
]);

// Dans votre contrôleur principal ou run block
angular.module('votre-app').run([
  'IframeMessageService',
  function(IframeMessageService) {
    IframeMessageService.init();
  }
]);
```

### Option 3 : Utilisation dans un template HTML

```html
<!-- Dans votre vue AngularJS -->
<div ng-controller="VotreController">
  <iframe
    id="exo-musicxml-iframe"
    src="http://localhost:4200/7"
    width="100%"
    height="800px"
    frameborder="0">
  </iframe>
</div>
```

## Exemple complet d'intégration

```javascript
angular.module('votre-app').controller('ExerciseController', [
  '$scope',
  '$rootScope',
  '$window',
  '$http',
  function($scope, $rootScope, $window, $http) {

    $scope.currentSequence = '7';
    $scope.iframeUrl = 'http://localhost:4200/' + $scope.currentSequence;

    // Gestion des messages postMessage
    function handleMessage(event) {
      const message = event.data;

      if (message && message.eventName) {
        console.log('Événement reçu:', message.eventName, message.data);
        $rootScope.$broadcast(message.eventName, message.data);

        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }
    }

    $window.addEventListener('message', handleMessage, false);

    // Écouter le changement de séquence
    $scope.$on('sequence-change', function(event, data) {
      console.log('Changement de séquence:', data);

      // Sauvegarder les résultats
      saveExerciseResults(data);

      // Charger la prochaine séquence
      $scope.currentSequence = data.nextSequence;
      $scope.iframeUrl = 'http://localhost:4200/' + data.nextSequence;
    });

    // Fonction pour sauvegarder les résultats
    function saveExerciseResults(data) {
      const payload = {
        sequence: data.currentSequence,
        score: data.results.percentage,
        totalNotes: data.results.totalNotes,
        goodTaps: data.results.goodTaps,
        level: data.results.level,
        timestamp: data.timestamp
      };

      // Envoyer au serveur
      $http.post('/api/exercises/results', payload)
        .then(function(response) {
          console.log('Résultats sauvegardés:', response.data);
        })
        .catch(function(error) {
          console.error('Erreur lors de la sauvegarde:', error);
        });
    }

    // Nettoyer à la destruction
    $scope.$on('$destroy', function() {
      $window.removeEventListener('message', handleMessage);
    });
  }
]);
```

## Template HTML correspondant

```html
<div ng-controller="ExerciseController">
  <div class="exercise-container">
    <h2>Exercice de rythme</h2>
    <p>Séquence actuelle : {{ currentSequence }}</p>

    <!-- L'iframe sera rechargée automatiquement quand iframeUrl change -->
    <iframe
      ng-src="{{ iframeUrl | trustAsResourceUrl }}"
      width="100%"
      height="800px"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
</div>
```

## Filtres nécessaires (pour ng-src)

```javascript
angular.module('votre-app').filter('trustAsResourceUrl', [
  '$sce',
  function($sce) {
    return function(val) {
      return $sce.trustAsResourceUrl(val);
    };
  }
]);
```

## Sécurité

**IMPORTANT** : Pour la production, décommentez et configurez la vérification de l'origine :

```javascript
const allowedOrigin = 'https://votre-domaine.com';
if (event.origin !== allowedOrigin) {
  console.warn('Message reçu d\'une origine non autorisée:', event.origin);
  return;
}
```

Également, dans le fichier `post-message.service.ts`, remplacez :
```typescript
window.parent.postMessage(message, '*');
```

Par :
```typescript
window.parent.postMessage(message, 'https://votre-domaine-parent.com');
```

## Événements disponibles

Actuellement, l'application émet uniquement l'événement `sequence-change`, mais l'architecture permet d'ajouter facilement d'autres événements :

- `exercise-started` : Quand l'exercice démarre
- `exercise-paused` : Quand l'exercice est mis en pause
- `exercise-finished` : Quand l'exercice se termine
- `tap-recorded` : À chaque tap de l'utilisateur
- `settings-changed` : Quand les paramètres changent

Pour ajouter ces événements, utilisez simplement :
```typescript
this.postMessageService.emitToParent('nom-evenement', { ...data });
```
