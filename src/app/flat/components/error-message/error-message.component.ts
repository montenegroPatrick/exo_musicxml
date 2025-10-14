import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  template: `
    <div class="w-full h-20"></div>
    <div class="w-full p-4 flex flex-col items-center justify-center">
      <p class="text-lg w-80 text-center">
        {{ message() }}
      </p>
    </div>
  `,
})
export class ErrorMessageComponent {
  message = input<string>(
    'Une erreur est survenue lors de la récupération du fichier XML.'
  );
}
