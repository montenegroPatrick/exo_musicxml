import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Level, LEVEL_OPTIONS } from '@app/flat/models/tap.model';
import { Button, ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule } from 'primeng/slider';
import { TapRythmService } from '@app/flat/service/tap-rythm.service';
import { ExerciseStateService } from '@app/services/exercise-state.service';
@Component({
  selector: 'app-settings-button',
  imports: [
    ButtonModule,
    Dialog,
    Button,
    SelectModule,
    FormsModule,
    ToggleSwitchModule,
    NgTemplateOutlet,
    SliderModule,
  ],

  styles: ``,
  template: `
    <p-button
      icon="pi pi-cog"
      (click)="showDialog()"
      styleClass=" p-0! [&_.p-button-icon]:text-[25px]! "
    />
    <p-dialog
      [(visible)]="visible"
      header="Paramètres"
      [modal]="true"
      [style]="{
        width: screenWidth() > 800 ? '500px' : '80%',

      }"
    >
      <div class="flex  flex-col justify-between items-center gap-10 md:p-8">
        <div class="flex w-full h-full justify-between items-center gap-10">
          <p class="text-secondary">Niveau</p>
          <p-select
            class="z-20"
            [options]="levelOptions"
            [(ngModel)]="level"
            (onChange)="handleLevelChange.emit(level)"
            placeholder="Sélectionnez un niveau"
          />
        </div>
        <div class="flex w-full h-full justify-between items-center gap-10">
          <p class="text-secondary">Aide sonore</p>
          <p-toggle-switch
            [(ngModel)]="partSound"
            (onChange)="handlePartSoundChange.emit(partSound)"
          />
        </div>
        <ng-container
          *ngTemplateOutlet="
            slideSetting;
            context: {
              label: 'volume',
              value: masterVolume,
              onChange: onMasterVolumeChange
            }
          "
        ></ng-container>

        <ng-container
          *ngTemplateOutlet="
            slideSetting;
            context: {
              label: 'Tap volume',
              value: tapVolume,
              onChange: onTapVolumeChange
            }
          "
        ></ng-container>
      </div>
      <ng-template #footer>
        <p-button
          label="Cancel"
          [text]="true"
          severity="secondary"
          (click)="cancelSettings()"
        />
        <p-button
          label="Save"
          [outlined]="true"
          severity="secondary"
          (click)="saveSettings()"
        />
      </ng-template>
    </p-dialog>

    <ng-template
      #slideSetting
      let-label="label"
      let-value="value"
      let-onChange="onChange"
    >
      <div class="flex w-full h-full justify-between items-center gap-10">
        <p class="text-secondary">{{ label }}</p>
        <p-slider
          class="min-w-30 md:min-w-44 lg:min-w-56"
          [ngModel]="value"
          (onChange)="onChange($event.value)"
        />
      </div>
    </ng-template>
  `,
})
export class SettingsButtonComponent implements OnInit, OnDestroy {
  //input
  isListening = input<boolean>(false);
  isPlaying = input<boolean>(false);
  // output
  handleLevelChange = output<Level>();
  handlePartSoundChange = output<boolean>();
  handleMasterVolumeChange = output<number>();
  handleMetronomeVolumeChange = output<number>();
  handleTapVolumeChange = output<number>();
  // service
  private tapRythmService = inject(TapRythmService);
  private exerciseState = inject(ExerciseStateService);
  screenWidth = signal(window.innerWidth);
  screenHeight = signal(window.innerHeight);

  visible = false;
  levelOptions = LEVEL_OPTIONS;
  level: Level = this.exerciseState.level();
  partSound: boolean = this.exerciseState.partSound();
  masterVolume: number = this.exerciseState.masterVolume();
  tapVolume: number = this.exerciseState.tapVolume();
  metronomeVolume: number = this.exerciseState.metronomeVolume();

  ngOnInit(): void {
    window.addEventListener('resize', this.resizeListener);
  }

  private resizeListener = () => {
    this.screenWidth.set(window.innerWidth);
    this.screenHeight.set(window.innerHeight);
  };
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }
  showDialog = () => {
    this.visible = true;
  };

  onMasterVolumeChange = (value: number) => {
    this.handleMasterVolumeChange.emit(value);
  };
  onMetronomeVolumeChange = (value: number) => {
    this.handleMetronomeVolumeChange.emit(value);
  };
  onTapVolumeChange = (value: number) => {
    this.handleTapVolumeChange.emit(value);
  };
  cancelSettings = () => {
    // Reload current values from exerciseState
    this.level = this.exerciseState.level();
    this.partSound = this.exerciseState.partSound();
    this.masterVolume = this.exerciseState.masterVolume();
    this.tapVolume = this.exerciseState.tapVolume();
    this.metronomeVolume = this.exerciseState.metronomeVolume();
    this.visible = false;
  };
  saveSettings = () => {
    this.exerciseState.saveSettings();
    this.visible = false;
  };
}
