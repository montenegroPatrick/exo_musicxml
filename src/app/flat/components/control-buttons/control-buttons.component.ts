import {
  Component,
  computed,
  input,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Button, ButtonModule } from 'primeng/button';
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
      [model]="menuItems"
      dropdownIcon="pi pi-ellipsis-v"
      class="icon-size-15 [&_.p-button]:!p-0 [&_.p-split-button]:!p-0 [&_.p-button]:!bg-transparent [&_.p-button]:!hover:bg-transparent [&_.p-button]:!active:bg-transparent [&_.p-button]:!border-none "
    ></p-split-button>
  `,
})
export class ControlButtonsComponent {
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
  menuItems: MenuItem[] = [
    {
      label: 'Ecoute seul',
      icon: 'pi pi-headphones',
      command: () => this.startMode.set('listening'),
    },
    {
      label: "Commencer l'exercice",
      icon: 'pi pi-play-circle',
      command: () => this.startMode.set('playing'),
    },
  ];
  startStop = () => {
    if (this.startMode() === 'listening') {
      this.toggleListen.emit();
    } else {
      this.playStop.emit();
    }
  };
}
