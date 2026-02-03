import { Component, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
}

@Component({
  selector: 'app-subtitle-settings',
  imports: [ButtonModule, MenuModule],
  template: `
    <div class="relative">
      <p-button
        [icon]="'pi pi-language'"
        [text]="true"
        (onClick)="menu.toggle($event)"
      />
      <p-menu #menu [model]="menuItems()" [popup]="true" appendTo="body" />
    </div>
  `,
})
export class SubtitleSettingsComponent {
  subtitlesEnabled = signal<boolean>(false);
  currentTrack = signal<string | null>(null);
  availableTracks = signal<SubtitleTrack[]>([
    { id: 'off', label: 'Désactivé', language: '' },
    { id: 'fr', label: 'Français', language: 'fr' },
    { id: 'en', label: 'English', language: 'en' },
  ]);

  subtitleChange = output<string | null>();

  menuItems = () => {
    return this.availableTracks().map((track) => ({
      label: track.label,
      icon: this.currentTrack() === track.id ? 'pi pi-check' : '',
      command: () => this.selectTrack(track.id),
    }));
  };

  selectTrack(trackId: string) {
    if (trackId === 'off') {
      this.subtitlesEnabled.set(false);
      this.currentTrack.set(null);
      this.subtitleChange.emit(null);
    } else {
      this.subtitlesEnabled.set(true);
      this.currentTrack.set(trackId);
      this.subtitleChange.emit(trackId);
    }
  }
}
