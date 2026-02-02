import { Component, computed, inject } from '@angular/core';
import { ControlBarService } from './services/control-bar.service';
import { CommonModule } from '@angular/common';
import { AudioMixerBarComponent } from './bars/audio-mixer-bar/audio-mixer-bar.component';
import { VideoBarComponent } from './bars/video-bar/video-bar.component';

@Component({
  selector: 'app-control-bar',
  imports: [CommonModule, AudioMixerBarComponent, VideoBarComponent],
  template: `
    <p
      class="absolute bottom-0 left-0 right-0 bg-black/35 backdrop-blur-xl h-15"
    >
      @switch (typeControlBar()) {
        @case ('video') {
          <app-video-bar></app-video-bar>
        }
        @case ('video-xml') {
          <app-video-bar></app-video-bar>
        }
        @case ('audio-mixer') {
          <app-audio-mixer-bar></app-audio-mixer-bar>
        }
        @default {
          <app-video-bar></app-video-bar>
        }
      }
    </p>
  `,
  styles: ``,
})
export class ControlBarComponent {
  private _controlBarService = inject(ControlBarService);
  typeControlBar = computed(() => this._controlBarService.controlBar());
}
