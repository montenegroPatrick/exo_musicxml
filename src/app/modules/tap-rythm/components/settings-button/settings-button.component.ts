import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Level,
  LEVEL_OPTIONS,
} from '@app/modules/tap-rythm/interface/flat.interface';
import { TapRythmService } from '@app/modules/tap-rythm/services/tap-rythm.service';
import { ExerciseStateService } from '@app/modules/tap-rythm/services/exercise-state.service';
import { L10N_LOCALE, L10nTranslatePipe } from 'angular-l10n';

@Component({
  selector: 'app-settings-button',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    L10nTranslatePipe,
  ],

  styles: ``,
  template: `
    <div class="relative">
      <button
        class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-white cursor-pointer bg-transparent border-none"
        [class.bg-white/20]="visible"
        title="Réglages"
        (click)="showDialog()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      @if (visible) {
        <!-- Overlay -->
        <div class="fixed inset-0 z-[10] bg-black/[0.01]" (click)="visible = false"></div>

        <!-- Popin -->
        <div class="settings-popin absolute bottom-[calc(100%+16px)] right-0 w-72 bg-black/95 backdrop-blur-xl border border-white/20 p-5 rounded-2xl z-[80] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div class="flex flex-col gap-6">

            <!-- Vitesse (Level) -->
            <div class="flex flex-col gap-3">
              <span class="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{{ 'label.exo_xml.level' | translate: locale.language }}</span>
              <select class="w-full bg-black/40 border border-white/10 rounded-lg text-white text-xs px-3 py-2 outline-none cursor-pointer"
                      [ngModel]="level"
                      (ngModelChange)="onLevelChange($event)">
                @for (opt of levelOptions; track opt.value) {
                  <option class="bg-zinc-800" [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>

            <!-- Son de la partition -->
            <div class="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
              <span class="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{{ 'label.exo_xml.part_sound' | translate: locale.language }}</span>
              <div class="flex items-center bg-white/5 p-1 rounded-lg border border-white/10 shrink-0">
                <button (click)="onPartSoundSet(false)" 
                        class="px-3 py-1 text-[9px] font-bold uppercase transition-all rounded-md cursor-pointer border-none"
                        [class.bg-white]="!partSound"
                        [class.text-black]="!partSound"
                        [class.bg-transparent]="partSound"
                        [class.text-white/40]="partSound">OFF</button>
                <button (click)="onPartSoundSet(true)" 
                        class="px-3 py-1 text-[9px] font-bold uppercase transition-all rounded-md cursor-pointer border-none"
                        [class.bg-[#FA5E46]]="partSound"
                        [class.text-white]="partSound"
                        [class.bg-transparent]="!partSound"
                        [class.text-white/40]="!partSound">ON</button>
              </div>
            </div>

            <!-- Volume Général -->
            <ng-container *ngTemplateOutlet="slideSetting; context: { label: 'label.exo_xml.master_volume' | translate: locale.language, value: masterVolume, onChange: onMasterVolumeChange }"></ng-container>

            <!-- Volume Tap -->
            <ng-container *ngTemplateOutlet="slideSetting; context: { label: 'label.exo_xml.tap_volume' | translate: locale.language, value: tapVolume, onChange: onTapVolumeChange }"></ng-container>

          </div>
        </div>
      }
    </div>

    <ng-template #slideSetting let-label="label" let-value="value" let-onChange="onChange">
      <div class="flex flex-col gap-3 pt-2 border-t border-white/10">
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{{ label }}</span>
          <span class="text-xs font-mono font-bold text-[#FA5E46]">{{ value }}</span>
        </div>
        <div class="relative h-4 flex items-center">
          <input type="range" 
                 [min]="0" 
                 [max]="100" 
                 [ngModel]="value" 
                 (input)="onChange($any($event.target).value)"
                 class="w-full h-1 bg-white rounded-full cursor-pointer accent-[#FA5E46]">
        </div>
      </div>
    </ng-template>
  `,
})
export class SettingsButtonComponent {
  //input
  isListening = input<boolean>(false);
  isPlaying = input<boolean>(false);
  // output
  handleLevelChange = output<Level>();
  handlePartSoundChange = output<boolean>();
  handleMasterVolumeChange = output<number>();
  handleMetronomeVolumeChange = output<number>();
  handleTapVolumeChange = output<number>();
  handleShowTutorial = output<void>();
  // service
  private tapRythmService = inject(TapRythmService);
  locale = inject(L10N_LOCALE);
  private exerciseState = inject(ExerciseStateService);
  
  visible = false;
  levelOptions = LEVEL_OPTIONS;
  level: Level = this.exerciseState.level();
  partSound: boolean = this.exerciseState.partSound();
  masterVolume: number = this.exerciseState.masterVolume();
  tapVolume: number = this.exerciseState.tapVolume();
  metronomeVolume: number = this.exerciseState.metronomeVolume();

  showDialog = () => {
    this.visible = !this.visible;
  };

  triggerSave = () => {
    this.exerciseState.saveSettings();
  };

  onLevelChange = (value: any) => {
    this.level = Number(value) as Level;
    this.handleLevelChange.emit(this.level);
    this.triggerSave();
  };

  onPartSoundSet = (value: boolean) => {
    if (this.partSound === value) return;
    this.partSound = value;
    this.handlePartSoundChange.emit(this.partSound);
    this.triggerSave();
  };

  onMasterVolumeChange = (value: number) => {
    this.masterVolume = value;
    this.handleMasterVolumeChange.emit(value);
    this.triggerSave();
  };
  onMetronomeVolumeChange = (value: number) => {
    this.metronomeVolume = value;
    this.handleMetronomeVolumeChange.emit(value);
    this.triggerSave();
  };
  onTapVolumeChange = (value: number) => {
    this.tapVolume = value;
    this.handleTapVolumeChange.emit(value);
    this.triggerSave();
  };
  showTutorial = () => {
    this.visible = false;
    this.handleShowTutorial.emit();
  };
}
