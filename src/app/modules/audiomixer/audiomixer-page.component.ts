import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioMixerComponent } from './audiomixer.component';
import { DiapoComponent } from '@core/shared/diapo/diapo.component';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';
import { ButtonModule } from 'primeng/button';
import { AudioMixerStateService } from './services/audio-mixer-state.service';
import { FlatService } from '@core/services/flat.service';

@Component({
  selector: 'app-audiomixer-page',
  standalone: true,
  imports: [CommonModule, AudioMixerComponent, DiapoComponent, ButtonModule],
  template: `
    <div class="relative w-full h-full bg-zinc-950 overflow-hidden flex flex-col">
      <!-- Diapo Section (Score) -->
      <div class="flex-grow min-h-0 relative">
        <app-diapo theme="light" [showControls]="true" [allowZoom]="true"></app-diapo>
      </div>

      <!-- Audio Mixer Section (Collapsible) -->
      <div 
        class="flex-none bg-zinc-900 border-t border-zinc-800 transition-all duration-500 ease-in-out"
        [style.height]="mixerVisible() ? '420px' : '0px'"
      >
        <div class="h-full w-full" [class.invisible]="!mixerVisible()">
          <app-audiomixer></app-audiomixer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .invisible {
      opacity: 0;
      pointer-events: none;
    }
  `]
})
export class AudioMixerPageComponent implements OnInit {
  private _diapoService = inject(DiapoStateService);
  private _mixerState = inject(AudioMixerStateService);
  private _flatService = inject(FlatService);
  
  mixerVisible = this._mixerState.mixerVisible;

  ngOnInit(): void {
    // Default to 'fit' for better overview
    this._diapoService.setViewMode('fit');
    this._diapoService.setLayoutMode('standard');
  }
}
