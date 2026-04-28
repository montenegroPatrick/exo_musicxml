import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlatService } from '@core/services/flat.service';
import { SharedMixerStripComponent } from '../../../control-bar/components/shared/mixer-strip/mixer-strip.component';
import { MidiMeterPlaceholderComponent } from '../../../control-bar/components/shared/mixer-strip/midi-meter-placeholder.component';

@Component({
  selector: 'app-midi-mixer',
  standalone: true,
  imports: [CommonModule, SharedMixerStripComponent, MidiMeterPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="midi-mixer-container flex flex-col h-full bg-[#1a1a1a] text-white overflow-hidden">
      <div class="flex-1 flex overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#111] px-2 py-1 gap-0.5">
        
        <!-- MIDI Tracks from Flat -->
        @for (part of parts(); track part.uuid) {
          <app-shared-mixer-strip
            [label]="part.name"
            [volume]="partVolumes[part.uuid] || 100"
            [trackLabelColor]="'#1e40af'"
            [showMeter]="true"
            (volumeChange)="onPartVolumeChange(part.uuid, $event)"
          >
            <app-midi-meter-placeholder meter />
          </app-shared-mixer-strip>
        }

        <div class="w-2"></div>

        <!-- Master Channel -->
        <app-shared-mixer-strip
          label="MASTER"
          [isMaster]="true"
          [volume]="masterVolume()"
          [showMeter]="true"
          (volumeChange)="onMasterVolumeChange($event)"
        >
          <app-midi-meter-placeholder meter />
        </app-shared-mixer-strip>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .midi-mixer-container {
      background: radial-gradient(circle at center, #1e1e1e 0%, #0a0a0a 100%);
    }
    .custom-scrollbar::-webkit-scrollbar { height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
  `]
})
export class MidiMixerComponent {
  private _flatService = inject(FlatService);
  
  parts = this._flatService.parts;
  masterVolume = signal(100);
  
  // Track volumes locally to avoid too many SDK calls if needed
  partVolumes: { [key: string]: number } = {};

  onPartVolumeChange(uuid: string, val: number) {
    this.partVolumes[uuid] = val;
    this._flatService.setPartVolume(uuid, val);
  }

  onMasterVolumeChange(val: number) {
    this.masterVolume.set(val);
    this._flatService.setMasterVolume(val);
  }
}


