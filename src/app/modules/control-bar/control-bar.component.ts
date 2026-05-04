import { Component, inject, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { ControlBarService } from './services/control-bar.service';
import { CommonModule } from '@angular/common';
import { ControlBarType } from '@core/interfaces/lesson.interface';
import { AudioMixerBarComponent } from './bars/audio-mixer-bar/audio-mixer-bar.component';
import { VideoBarComponent } from './bars/video-bar/video-bar.component';
import { VideoBarMobileComponent } from './bars/video-bar/mobile/video-bar-mobile.component';
import { MetronomeBarComponent } from './bars/metronome-bar/metronome-bar.component';
import { MetronomeBarMobileComponent } from './bars/metronome-bar/mobile/metronome-bar-mobile.component';
import { MusicXMLBarComponent } from './bars/musicxml-bar/musicxml-bar.component';
import { TapRythmBarComponent } from './bars/tap-rythm-bar/tap-rythm-bar.component';
import { HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-control-bar',
  standalone: true,
  imports: [CommonModule, AudioMixerBarComponent, VideoBarComponent, VideoBarMobileComponent, MetronomeBarComponent, MetronomeBarMobileComponent, MusicXMLBarComponent, TapRythmBarComponent],
  template: `
    <div class="relative bg-transparent h-auto w-full">
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
        @case ('metronome') {
          @if (isMobile()) {
            <app-metronome-bar-mobile></app-metronome-bar-mobile>
          } @else {
            <app-metronome-bar></app-metronome-bar>
          }
        }
        @case ('musicxml') {
          <app-musicxml-bar></app-musicxml-bar>
        }
        @case ('tap-rythm') {
          <app-tap-rythm-bar></app-tap-rythm-bar>
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
  
  /** Optional input to override the type from service */
  type = input<ControlBarType>();

  /** Reactive source of truth for the active control bar type */
  readonly typeControlBar = computed(() => this.type() || this._controlBarService.controlBar());

  // -- Responsive Logic --
  isMobile = signal(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }
}
