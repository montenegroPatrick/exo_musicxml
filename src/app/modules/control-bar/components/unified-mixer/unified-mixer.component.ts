import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlatService } from '@core/services/flat.service';
import { AudioService } from '@core/services/audio.service';
import { FaderComponent } from '../fader/fader.component';

@Component({
  selector: 'app-unified-mixer',
  standalone: true,
  imports: [CommonModule, FaderComponent],
  template: `
    <button (click)="toggleMixer()" 
            class="mixer-btn w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20 transition-all bg-transparent border-none p-0 text-white"
            [class.text-[#FA5E46]]="isOpen()"
            title="Mixeur">
      <i class="pi pi-sliders-v text-lg"></i>
    </button>

    @if (isOpen()) {
      <div class="absolute bottom-[calc(100%+12px)] right-0 bg-[#0A0A0A] border border-white/5 p-4 rounded-xl z-[100] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 min-w-[320px]">
        
        <div class="flex gap-2 justify-start overflow-x-auto pb-4 scrollbar-none min-h-[260px]">
          
          <!-- Case MIDI -->
          @if (mode() === 'midi') {
            @for (part of midiParts(); track part.uuid) {
              <div class="flex flex-col h-full bg-[#111] rounded-sm overflow-hidden min-w-[75px] border-r border-white/5">
                 <!-- Pan Knob (Visual) -->
                 <div class="py-2 flex flex-col items-center gap-0.5">
                    <span class="text-[7px] text-white/30 uppercase font-bold">Pan</span>
                    <div class="w-6 h-6 rounded-full border-2 border-white/10 relative">
                      <div class="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-white/40 rounded-full"></div>
                    </div>
                    <span class="text-[7px] text-white/30 font-bold mt-0.5">C</span>
                 </div>

                 <!-- Gain Display -->
                 <div class="mx-2 mb-2 bg-black py-0.5 rounded border border-white/10">
                    <span class="block text-[8px] font-mono text-center text-white/60">0.0</span>
                    <span class="block text-[6px] text-center text-white/20 uppercase font-black">DB</span>
                 </div>

                 <!-- Fader Area -->
                 <div class="flex-1 flex flex-col items-center justify-center py-4 bg-gradient-to-b from-black/40 to-transparent">
                    <app-fader [value]="100" (valueChange)="onMidiPartVolumeChange(part.uuid, $event)" />
                 </div>
                 
                 <!-- Controls Area -->
                 <div class="p-1.5 flex flex-col gap-1.5">
                    <div class="flex gap-1 px-1">
                      <button class="flex-1 py-1 text-[9px] font-black bg-white/5 border border-white/5 rounded-sm text-white/40 hover:text-white/60 transition-colors uppercase">M</button>
                      <button class="flex-1 py-1 text-[9px] font-black bg-white/5 border border-white/5 rounded-sm text-white/40 hover:text-white/60 transition-all uppercase">S</button>
                    </div>
                 </div>

                 <!-- Bottom Label Area -->
                 <div class="bg-[#333] py-2 text-center border-t border-white/10 mt-1">
                    <span class="text-[9px] font-black text-white/80 tracking-widest uppercase truncate px-1 block">{{ part.name || 'ALL' }}</span>
                 </div>
              </div>
            }

            <div class="w-px h-auto bg-white/5 mx-0.5"></div>

            <!-- Metronome Section -->
            <div class="flex flex-col h-full bg-[#111] rounded-sm overflow-hidden min-w-[75px] border-x border-white/5">
               <div class="py-2 flex flex-col items-center gap-0.5 opacity-30">
                  <span class="text-[7px] text-white/30 uppercase font-bold">Pan</span>
                  <div class="w-6 h-6 rounded-full border-2 border-white/10 relative"></div>
               </div>
               <div class="mx-2 mb-2 bg-black py-0.5 rounded border border-white/10">
                  <span class="block text-[8px] font-mono text-center text-white/60">80</span>
               </div>
               <div class="flex-1 flex flex-col items-center justify-center py-4">
                  <app-fader [value]="80" (valueChange)="onMetronomeVolumeChange($event)" />
               </div>
               <div class="p-1.5 flex flex-col gap-1.5">
                  <button (click)="toggleMetronomeMute()" 
                          class="mx-1 py-1 text-[9px] font-black rounded-sm border transition-all uppercase"
                          [class.bg-[#FA5E46]]="metronomeMuted()"
                          [class.border-[#FA5E46]]="metronomeMuted()"
                          [class.text-white]="metronomeMuted()"
                          [class.bg-white/5]="!metronomeMuted()"
                          [class.border-white/5]="!metronomeMuted()"
                          [class.text-white/40]="!metronomeMuted()">M</button>
               </div>
               <div class="bg-[#333] py-2 text-center border-t border-white/10 mt-1">
                  <span class="text-[9px] font-black text-white/80 tracking-widest uppercase block">CLICK</span>
               </div>
            </div>
          }

          <!-- Case AUDIO -->
          @if (mode() === 'audio') {
            @for (track of audioTracks(); track $index) {
              <div class="flex flex-col h-full bg-[#111] rounded-sm overflow-hidden min-w-[75px] border-r border-white/5">
                 <div class="py-2 flex flex-col items-center gap-0.5">
                    <span class="text-[7px] text-white/30 uppercase font-bold">Pan</span>
                    <div class="w-6 h-6 rounded-full border-2 border-white/10 relative"></div>
                 </div>
                 <div class="mx-2 mb-2 bg-black py-0.5 rounded border border-white/10">
                    <span class="block text-[8px] font-mono text-center text-white/60">{{ (track.volume * 10).toFixed(1) }}</span>
                 </div>
                 <div class="flex-1 flex flex-col items-center justify-center py-4">
                    <app-fader [value]="track.volume * 100" (valueChange)="onAudioTrackVolumeChange($index, $event)" />
                 </div>
                 <div class="p-1.5 flex flex-col gap-1.5">
                    <div class="flex gap-1 px-1">
                      <button class="flex-1 py-1 text-[9px] font-black bg-white/5 border border-white/5 rounded-sm text-white/40 uppercase">M</button>
                      <button class="flex-1 py-1 text-[9px] font-black bg-white/5 border border-white/5 rounded-sm text-white/40 uppercase">S</button>
                    </div>
                 </div>
                 <div class="bg-[#333] py-2 text-center border-t border-white/10 mt-1">
                    <span class="text-[9px] font-black text-white/80 tracking-widest uppercase truncate px-1 block">{{ track.label || 'ALL' }}</span>
                 </div>
              </div>
            }
          }

          <div class="w-px h-auto bg-white/5 mx-0.5"></div>

          <!-- Master Section -->
          <div class="flex flex-col h-full bg-[#050505] rounded-sm overflow-hidden min-w-[75px] border border-[#FA5E46]/30 shadow-[0_0_15px_rgba(250,94,70,0.1)]">
             <div class="py-2 flex flex-col items-center gap-0.5">
                <span class="text-[7px] text-[#FA5E46]/60 uppercase font-bold">Out</span>
                <div class="w-2 h-2 rounded-full bg-[#FA5E46] shadow-[0_0_8px_#FA5E46]"></div>
             </div>
             <div class="mx-2 mb-2 bg-black py-0.5 rounded border border-[#FA5E46]/30">
                <span class="block text-[8px] font-mono text-center text-[#FA5E46]">0.0</span>
             </div>
             <div class="flex-1 flex flex-col items-center justify-center py-4 bg-gradient-to-b from-[#FA5E46]/10 to-transparent">
                <app-fader [value]="masterVolume()" (valueChange)="onMasterVolumeChange($event)" />
             </div>
             <div class="p-1.5 flex flex-col gap-1.5">
                <button class="mx-1 py-1 text-[9px] font-black bg-white/5 border border-white/10 rounded-sm text-white/40 uppercase">M</button>
             </div>
             <div class="bg-[#FA5E46] py-2 text-center mt-1">
                <span class="text-[9px] font-black text-white tracking-widest uppercase block">MASTER</span>
             </div>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .scrollbar-none::-webkit-scrollbar { display: none; }
  `],
})
export class UnifiedMixerComponent {
  mode = input<'audio' | 'midi'>('audio');
  
  private _flatService = inject(FlatService);
  private _audioService = inject(AudioService);

  isOpen = signal(false);
  
  midiParts = this._flatService.parts;
  audioTracks = computed(() => this._audioService.audioTracks());
  
  masterVolume = signal(100);
  metronomeVolume = signal(80);
  metronomeMuted = signal(false);

  toggleMixer() {
    this.isOpen.update((v) => !v);
  }

  toggleMetronomeMute() {
    this.metronomeMuted.update(v => !v);
    if (this.metronomeMuted()) {
        this._flatService.setMetronomeVolume(0);
    } else {
        this._flatService.setMetronomeVolume(this.metronomeVolume());
    }
  }

  onMasterVolumeChange(value: number) {
    this.masterVolume.set(value);
    if (this.mode() === 'midi') {
      this._flatService.setMasterVolume(value);
    } else {
      // Pour l'audio service, master volume global ?
      // L'audio service n'a pas forcément de master volume global simple exposé ainsi
    }
  }

  onMidiPartVolumeChange(partUuid: string, value: number) {
    this._flatService.setPartVolume(partUuid, value);
  }

  onMetronomeVolumeChange(value: number) {
    this.metronomeVolume.set(value);
    if (!this.metronomeMuted()) {
      this._flatService.setMetronomeVolume(value);
    }
  }

  onAudioTrackVolumeChange(index: number, value: number) {
    this._audioService.setTrackVolume(index, value / 100);
  }
}
