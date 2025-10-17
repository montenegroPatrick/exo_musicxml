import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

import {
  L10nConfig,
  L10nLocale,
  L10nTranslationLoader,
  L10nProvider,
  L10nValidation,
  L10N_LOCALE,
  L10nNumberFormatOptions,
  L10nDateTimeFormatOptions,
  parseDigits,
  L10nLocaleResolver,
} from 'angular-l10n';
export const l10nConfig: L10nConfig = {
  format: 'language-region',
  providers: [{ name: 'language', asset: 'language' }],
  cache: true,
  keySeparator: '.',
  defaultLocale: {
    language: 'fr-FR',
    currency: 'EUR',
    timeZone: 'Europe/Paris',
  },
  schema: [
    {
      locale: {
        language: 'fr-FR',
        currency: 'EUR',
        timeZone: 'Europe/Paris',
      },
    },
    {
      locale: { language: 'en-GB', currency: 'GBP', timeZone: 'Europe/London' },
    },
    { locale: { language: 'it-IT', currency: 'EUR', timeZone: 'Europe/Rome' } },
    {
      locale: { language: 'de-DE', currency: 'EUR', timeZone: 'Europe/Berlin' },
    },
    {
      locale: { language: 'es-ES', currency: 'EUR', timeZone: 'Europe/Madrid' },
    },
    {
      locale: { language: 'pt-PT', currency: 'EUR', timeZone: 'Europe/Lisbon' },
    },
  ],
};

@Injectable()
export class TranslationLoader implements L10nTranslationLoader {
  public get(
    language: string,
    provider: L10nProvider
  ): Observable<{ [key: string]: any }> {
    /**
     * Translation files are lazy-loaded via dynamic import and will be split into separate chunks during build.
     * Assets names and keys must be valid variable names
     */
    const data = import(`../i18n/${language}/${provider.asset}.json`);
    return from(data);
  }
}
