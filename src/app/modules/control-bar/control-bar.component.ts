import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { ControlBarService } from './services/control-bar.service';
import { CommonModule } from '@angular/common';
import { AudioMixerBarComponent } from './bars/audio-mixer-bar/audio-mixer-bar.component';
import { VideoBarComponent } from './bars/video-bar/video-bar.component';

@Component({
  selector: 'app-control-bar',
  standalone: true,
  imports: [CommonModule, AudioMixerBarComponent, VideoBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative bg-black/40 backdrop-blur-2xl border-t border-white/5 h-auto w-full shadow-2xl">
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
  styles: [`
    :host {
      display: block;
      width: 100%;
      z-index: 40;
    }
  `],
})
export class ControlBarComponent {
  private readonly _controlBarService = inject(ControlBarService);
  
  /** Reactive source of truth for the active control bar type */
  readonly typeControlBar = this._controlBarService.controlBar;
  
  /** Input to toggle next/prev global navigation buttons */
  showNavigation = input<boolean>(true);
}
