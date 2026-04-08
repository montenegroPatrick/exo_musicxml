import { Component, computed, inject, input } from '@angular/core';
import { ControlBarService } from './services/control-bar.service';
import { CommonModule } from '@angular/common';
import { AudioMixerBarComponent } from './bars/audio-mixer-bar/audio-mixer-bar.component';
import { VideoBarComponent } from './bars/video-bar/video-bar.component';

@Component({
  selector: 'app-control-bar',
  standalone: true,
  imports: [CommonModule, AudioMixerBarComponent, VideoBarComponent],
  template: `
    <div
      class="absolute bottom-0 left-0 right-0 bg-black/45 backdrop-blur-xl h-10 w-full"
    >
      @switch (typeControlBar()) {
        @case ('video') {
          <app-video-bar [showNavigation]="showNavigation()"></app-video-bar>
        }
        @case ('video-xml') {
          <app-video-bar [showNavigation]="showNavigation()"></app-video-bar>
        }
        @case ('audio-mixer') {
          <app-audio-mixer-bar [showNavigation]="showNavigation()"></app-audio-mixer-bar>
        }
        @default {
          <app-video-bar [showNavigation]="showNavigation()"></app-video-bar>
        }
      }
    </div>
  `,
  styles: ``,
})
export class ControlBarComponent {
  private _controlBarService = inject(ControlBarService);
  typeControlBar = computed(() => this._controlBarService.controlBar());
  
  /** Input to toggle next/prev global navigation buttons */
  showNavigation = input<boolean>(true);
}
