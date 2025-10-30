import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { L10N_LOCALE, L10nTranslatePipe } from 'angular-l10n';

@Component({
  selector: 'app-help-button',
  imports: [ButtonModule, TooltipModule, Dialog, L10nTranslatePipe],
  template: `
    <div pTooltip="Help" tooltipPosition="top">
      <p-button
        label=""
        (click)="showDialog()"
        icon="pi pi-question-circle"
        size="large"
        styleClass="
    p-0! [&_.p-button-icon]:text-[25px]! "
      />
    </div>
    <p-dialog
      [(visible)]="visible"
      [header]="'Help'"
      [modal]="true"
      [style]="{
        width: screenWidth() > 800 ? '500px' : '80%',

      }"
    >
      <div class="flex flex-col justify-between items-start gap-10 md:p-8">
        <div class="flex items-center gap-2">
          <i class="pi pi-play"></i>
          <p>
            Attention aux casque bluetooth, peut insérer quelques milliseconds
            de latence
          </p>
        </div>
        <div class="flex items-center gap-2">
          <i class="pi pi-cog"></i>
          <p>
            Vous pouvez ajuster le volume des différents éléments dans le menu
            paramètres
          </p>
        </div>
        <div class="flex items-center gap-2">
          <i class="pi pi-list"></i>
          <p>
            Vous pouvez choisir de commencer l'exercice ou de seulement écouter
            l'exercice avant de commencer
          </p>
        </div>
        <div class="flex items-center gap-2">
          <i class="pi pi-step-forward"></i>
          <p>Next</p>
        </div>
        <div class="flex items-center gap-2">
          <i class="pi pi-step-backward"></i>
          <p>Previous</p>
        </div>
      </div>
    </p-dialog>
  `,
  styles: ``,
})
export class HelpButtonComponent {
  locale = inject(L10N_LOCALE);
  screenWidth = signal(window.innerWidth);
  visible = false;

  showDialog = () => {
    this.visible = true;
  };
}
