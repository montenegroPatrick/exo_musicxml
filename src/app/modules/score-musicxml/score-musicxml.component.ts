import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XmlComponent } from '@core/shared/xml/xml.component';
import { LessonService } from '../lesson/services/lesson.service';
import { CoreDataService } from '@core/services/core-data.service';
import { MidiMixerComponent } from './components/midi-mixer/midi-mixer.component';
import { MidiMixerStateService } from './services/midi-mixer-state.service';

@Component({
  selector: 'app-score-musicxml-page',
  standalone: true,
  imports: [CommonModule, XmlComponent, MidiMixerComponent],
  template: `
    <div class="relative w-full h-full bg-zinc-950 overflow-hidden flex flex-col">
      <!-- Score Section -->
      <div class="flex-grow min-h-0 relative">
        @if (xmlContent()) {
          <app-xml [xml]="xmlContent()!"></app-xml>
        } @else {
          <div class="absolute inset-0 flex items-center justify-center text-zinc-400">
            <div class="flex flex-col items-center gap-4">
              <div class="w-12 h-12 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin"></div>
              <p class="font-medium tracking-tight">Chargement de la partition MIDI...</p>
            </div>
          </div>
        }
      </div>

      <!-- MIDI Mixer Section (Collapsible) -->
      <div 
        class="flex-none bg-zinc-900 border-t border-zinc-800 transition-all duration-500 ease-in-out"
        [style.height]="mixerVisible() ? '420px' : '0px'"
      >
        <div class="h-full w-full" [class.invisible]="!mixerVisible()">
          <app-midi-mixer></app-midi-mixer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreMusicXMLPageComponent implements OnInit, OnDestroy {
  private readonly _lessonService = inject(LessonService);
  private readonly _coreDataStore = inject(CoreDataService);
  private readonly _mixerState = inject(MidiMixerStateService);

  readonly xmlContent = this._lessonService.xmlContent;
  readonly mixerVisible = this._mixerState.mixerVisible;

  ngOnInit(): void {
    console.log('[ScoreMusicXML] Initializing MIDI mode...');
    this._coreDataStore.setMidiMode(true);
    
    // Si on arrive sur cette route directement avec un mock
    const urlParams = new URLSearchParams(window.location.search);
    const mock = urlParams.get('mock');
    if (mock) {
      console.log(`[ScoreMusicXML] Loading mock data: ${mock}`);
      this._lessonService.loadTestData(mock).subscribe();
    }
  }

  ngOnDestroy(): void {
    console.log('[ScoreMusicXML] Leaving MIDI mode...');
    this._coreDataStore.setMidiMode(false);
  }
}
