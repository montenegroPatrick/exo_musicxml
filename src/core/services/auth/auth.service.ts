import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  static readonly SECRET_KEY = 'imusic_school_rythm_exercise_secret_2025';

  //
  isValidToken(token: string | null): boolean {
    if (token == null) {
      return false;
    }

    try {
      const [dataBase64, signature] = token.split('.');

      if (!dataBase64 || !signature) {
        return false;
      }

      const dataString = atob(dataBase64);
      const data = JSON.parse(dataString); // json {timestamp: number, typeId: string}

      if (data.typeId == null) {
        return false;
      }

      if (data.timestamp == null) {
        return false;
      }

      const expected = this.simpleHash(dataString + AuthService.SECRET_KEY);

      if (expected !== signature) {
        return false;
      }

      const tokenAge = Date.now() - data.timestamp;

      if (tokenAge > 360 * 1000) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  //hash function
  simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}
