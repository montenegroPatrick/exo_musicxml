import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { ControlBarService } from './services/control-bar.service';
import { CommonModule } from '@angular/common';
import { AudioMixerBarComponent } from './bars/audio-mixer-bar/audio-mixer-bar.component';
import { VideoBarComponent } from './bars/video-bar/video-bar.component';
import { VideoBarMobileComponent } from './bars/video-bar/mobile/video-bar-mobile.component';
import { HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-control-bar',
  standalone: true,
  imports: [CommonModule, AudioMixerBarComponent, VideoBarComponent, VideoBarMobileComponent],
  template: `
    <div class="relative bg-transparent h-auto w-full shadow-2xl">
      @switch (typeControlBar()) {
        @case ('video') {
          @if (isMobile()) {
            <app-video-bar-mobile></app-video-bar-mobile>
          } @else {
            <app-video-bar></app-video-bar>
          }
        }
        @case ('video-xml') {
          @if (isMobile()) {
            <app-video-bar-mobile></app-video-bar-mobile>
          } @else {
            <app-video-bar></app-video-bar>
          }
        }
        @case ('audio-mixer') {
          <app-audio-mixer-bar></app-audio-mixer-bar>
        }
        @default {
          @if (isMobile()) {
            <app-video-bar-mobile></app-video-bar-mobile>
          } @else {
            <app-video-bar></app-video-bar>
          }
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

  // -- Responsive Logic --
  isMobile = signal(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }
}
