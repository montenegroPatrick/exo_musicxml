import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '@core/services/audio.service';
import { MixerChannelComponent } from './components/mixer-channel/mixer-channel.component';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audiomixer',
  standalone: true,
  imports: [CommonModule, MixerChannelComponent, SliderModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="audiomixer-container flex flex-col h-full bg-[#1a1a1a] text-white overflow-hidden">
      <!-- Mixer Desk -->
      <div class="flex-1 flex overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#111] px-2 py-1 gap-0.5">
        
        <!-- Individual Tracks -->
        @for (track of audioTracks(); track track.name; let i = $index) {
          <app-mixer-channel 
            [trackIndex]="i" 
            [label]="track.label"
          ></app-mixer-channel>
        } @empty {
          <div class="flex-1 flex items-center justify-center text-zinc-500 font-medium opacity-50">
            <div class="flex flex-col items-center gap-4">
              <i class="pi pi-volume-off text-4xl"></i>
              <span>Aucune piste chargée</span>
            </div>
          </div>
        }

        <!-- Master Channel -->
        <app-mixer-channel [isMaster]="true" label="MASTER"></app-mixer-channel>
      </div>
    </div>
  `,
  styles: [`
    .audiomixer-container {
      background: radial-gradient(circle at center, #1e1e1e 0%, #0a0a0a 100%);
    }

    .custom-scrollbar::-webkit-scrollbar {
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #000;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    .master-strip {
      border-left: 2px solid #111;
      box-shadow: -12px 0 25px rgba(0,0,0,0.6);
      z-index: 20;
    }
  `]
})
export class AudioMixerComponent {
  private _audioService = inject(AudioService);

  audioTracks = computed(() => this._audioService.audioTracks());
}
