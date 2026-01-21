import { Injectable } from '@angular/core';

export interface IPostMessage {
  eventName: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class PostMessageService {
  /**
   * Émet un événement vers l'application parente via postMessage
   * Compatible avec le système $broadcast d'AngularJS
   *
   * @param eventName - Nom de l'événement (sera utilisé pour $broadcast dans le parent)
   * @param data - Données associées à l'événement
   */
  emitToParent(message: IPostMessage): void {
    if (!window.parent || window.parent === window) {
      console.warn('[PostMessageService] Aucune fenêtre parente détectée');
      return;
    }

    try {
      // Envoie le message à la fenêtre parente
      // '*' permet d'envoyer à n'importe quelle origine
      // Pour plus de sécurité, vous pouvez spécifier l'origine exacte: window.parent.postMessage(message, 'https://votre-domaine.com')
      window.parent.postMessage(message, '*');
      console.log('[PostMessageService] Message envoyé:', message);
    } catch (error) {
      console.error(
        "[PostMessageService] Erreur lors de l'envoi du message:",
        error
      );
    }
  }

  /**
   * Émet un événement de changement de séquence
   *
   * @param currentSequence - Séquence actuelle
   * @param nextSequence - Prochaine séquence demandée (optionnel)
   * @param results - Résultats de l'exercice (optionnel)
   */
  emitSequenceChange(
    currentSequence?: string,
    nextSequence?: string,
    results?: any
  ): void {
    this.emitToParent({
      eventName: 'NAV_NEXT_SEQ',
      data: {
        currentSequence,
        nextSequence,
        results,
        timestamp: Date.now(),
      },
    });
  }
}
