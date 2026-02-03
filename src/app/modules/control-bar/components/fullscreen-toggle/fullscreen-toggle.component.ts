import { Component, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-fullscreen-toggle',
  imports: [ButtonModule],
  template: `
    <p-button
      [icon]="isFullscreen() ? 'pi pi-window-minimize' : 'pi pi-window-maximize'"
      [text]="true"
      severity="secondary"
      (onClick)="toggle()"
    />
  `,
})
export class FullscreenToggleComponent {
  isFullscreen = signal<boolean>(false);
  fullscreenChange = output<boolean>();

  toggle() {
    const newState = !this.isFullscreen();
    this.isFullscreen.set(newState);
    this.fullscreenChange.emit(newState);
  }
}
