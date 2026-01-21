import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  L10N_LOCALE,
  L10nTranslatePipe,
  L10nTranslationService,
} from 'angular-l10n';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-control-buttons',
  standalone: true,
  imports: [
    ButtonModule,
    SplitButtonModule,
    L10nTranslatePipe,
    OverlayBadgeModule,
    SelectButtonModule,
    CommonModule,
    TooltipModule,
    FormsModule,
    DividerModule,
  ],
  template: `
    <div class="flex items-center gap-2">
      <!-- <p-button [icon]="icon()" (onClick)="startStop()" size="large"></p-button> -->
      @if(isPlaying() ) {
      <div class="flex items-center gap-2  ">
        <p-button
          [icon]="icon()"
          pTooltip="Exercice"
          rounded="false"
          [raised]="isPlaying()"
          (onClick)="startStop(1)"
          tooltipPosition="top"
          styleClass="p-1!"
          [tooltipDisabled]="isListening() || isPlaying()"
          size="large"
          [disabled]="isListening()"
        ></p-button>
        <!-- <p-button
        [icon]="dropDownIcon()"
        [tooltipDisabled]="isListening() || isPlaying()"
        pTooltip="Écoute"
        rounded="false"
        [raised]="isListening()"
        styleClass="p-1!"
        tooltipPosition="top"
        (onClick)="startStop(0)"
        size="large"
        [disabled]="isPlaying()"
        ></p-button> -->
      </div>
      }
    </div>
    <!-- <p-split-button
      [icon]="icon()"
      [severity]="severity()"
      (onClick)="startStop()"
      size="large"
      [model]="menuItems()"
      [dropdownIcon]="dropdownIcon()"
      class=" gap-4 [&_.p-button]:!p-0 rounded-sm! [&_.p-split-button]:!p-0 [&_.p-button]:!bg-transparent [&_.p-button]:!hover:bg-transparent [&_.p-button]:!active:bg-transparent [&_.p-button]:!border-none [&_.p-button-icon]:!text-[25px] [&_.p-split-button-dropdown-icon]:!text-[45px] "
    ></p-split-button> -->
  `,
})
export class ControlButtonsComponent {
  private translation = inject(L10nTranslationService);

  locale = inject(L10N_LOCALE);

  isPlaying = input<boolean>(false);
  isListening = input<boolean>(false);
  xmlLoaded = input<boolean>(false);
  playStop = output<void>();
  toggleListen = output<void>();
  startMode: WritableSignal<number> = signal(1);

  icon = computed(() =>
    this.startMode() === 1 && this.isPlaying() ? 'pi pi-stop' : 'pi pi-play'
  );
  dropDownIcon = computed(() => 'pi pi-headphones');
  options = computed<{ label: string; value: number }[]>(() => [
    {
      label: this.translation.translate('label.exo_xml.listen'),
      value: 0,
    },
    {
      label: this.translation.translate('label.exo_xml.exercise'),
      value: 1,
    },
  ]);
  // menuItems = computed<MenuItem[]>(() => [
  //   {
  //     label: this.translation.translate('label.exo_xml.listen'),
  //     icon: 'pi pi-headphones',
  //     command: () => {
  //       this.startMode.set(0);
  //       this.startStop();
  //     },
  //   },
  //   {
  //     label: this.translation.translate('label.exo_xml.exercise'),
  //     icon: 'pi pi-play-circle',
  //     command: () => {
  //       this.startMode.set(1);
  //       this.startStop();
  //     },
  //   },
  // ]);
  startStop = (mode: number) => {
    this.startMode.set(mode);
    if (mode === 0) {
      this.toggleListen.emit();
    } else {
      this.playStop.emit();
    }
  };
}
