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

@Component({
  selector: 'app-control-buttons',
  standalone: true,
  imports: [ButtonModule, SplitButtonModule],
  template: `
    <p-split-button
      [icon]="icon()"
      [severity]="severity()"
      (onClick)="startStop()"
      size="large"
      [model]="menuItems()"
      dropdownIcon="pi pi-ellipsis-v"
      class=" gap-4 [&_.p-button]:!p-0 rounded-sm! [&_.p-split-button]:!p-0 [&_.p-button]:!bg-transparent [&_.p-button]:!hover:bg-transparent [&_.p-button]:!active:bg-transparent [&_.p-button]:!border-none [&_.p-button-icon]:!text-[35px] [&_.p-split-button-dropdown-icon]:!text-[45px] "
    ></p-split-button>
  `,
})
export class ControlButtonsComponent {
  private translation = inject(L10nTranslationService);

  isPlaying = input<boolean>(false);
  isListening = input<boolean>(false);
  xmlLoaded = input<boolean>(false);
  playStop = output<void>();
  toggleListen = output<void>();
  startMode: WritableSignal<'listening' | 'playing'> = signal('playing');

  icon = computed(() =>
    this.startMode() === 'listening' && this.isListening()
      ? 'pi pi-stop'
      : this.startMode() === 'playing' && this.isPlaying()
      ? 'pi pi-stop-circle'
      : 'pi pi-play-circle'
  );

  severity = computed(() =>
    this.isListening() || this.isPlaying() ? 'warn' : 'primary'
  );

  menuItems = computed<MenuItem[]>(() => [
    {
      label: this.translation.translate('label.exo_xml.listen'),
      icon: 'pi pi-headphones',
      command: () => {
        this.startMode.set('listening');
        this.startStop();
      },
    },
    {
      label: this.translation.translate('label.exo_xml.exercise'),
      icon: 'pi pi-play-circle',
      command: () => {
        this.startMode.set('playing');
        this.startStop();
      },
    },
  ]);
  startStop = () => {
    if (this.startMode() === 'listening') {
      this.toggleListen.emit();
    } else {
      this.playStop.emit();
    }
  };
}
