import { Component, input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
@Component({
  selector: 'app-settings-button',
  imports: [ButtonModule, Dialog],
  templateUrl: './settings-button.component.html',
  styles: ``,
  template: `
    <p-button label="Settings" (click)="showDialog()" />
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [dismissableMask]="true"
      [closeOnEscape]="true"
      [closeOnBackdropClick]="true"
    >
      <p>Settings</p>
    </p-dialog>
  `,
})
export class SettingsButtonComponent {
  isListening = input<boolean>(false);
  isPlaying = input<boolean>(false);
  visible = false;
  showDialog = () => {
    this.visible = true;
  };
}
