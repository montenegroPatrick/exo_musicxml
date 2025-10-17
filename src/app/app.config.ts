import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { myTheme } from 'src/core/theme/theme';
import { provideL10nIntl, provideL10nTranslation } from 'angular-l10n';
import { l10nConfig, TranslationLoader } from './l10n-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideL10nTranslation(l10nConfig, {
      translationLoader: TranslationLoader,
    }),
    provideL10nIntl(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: myTheme,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
