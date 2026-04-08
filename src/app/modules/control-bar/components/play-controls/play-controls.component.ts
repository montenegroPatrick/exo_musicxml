import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ControlBarService } from '../../services/control-bar.service';

@Component({
  selector: 'app-play-controls',
  imports: [ButtonModule],
  template: `
    <section class="flex gap-1 text-white  rounded-lg">
      @if (showNavigation()) {
        <p-button
          icon="pi pi-angle-left"
          size="small"
          [text]="true"
          variant="text"
          styleClass="text-white!"
          (onClick)="previous.emit()"
        />
      }
      <p-button
        icon="pi pi-step-backward"
        size="small"
        [text]="true"
        variant="text"
        styleClass="text-white!"
        (onClick)="stepBackward.emit()"
      />
      <p-button
        size="small"
        [icon]="isPlaying() ? 'pi pi-pause' : 'pi pi-play'"
        [text]="true"
        styleClass="text-white!"
        (onClick)="togglePlay.emit()"
      />
      <p-button
        size="small"
        icon="pi pi-step-forward"
        [text]="true"
        styleClass="text-white!"
        (onClick)="stepForward.emit()"
      />
      @if (showNavigation()) {
        <p-button
          icon="pi pi-angle-right"
          size="small"
          [text]="true"
          variant="text"
          styleClass="text-white!"
          (onClick)="next.emit()"
        />
      }
    </section>
  `,
})
export class PlayControlsComponent {
  private _controlBarService = inject(ControlBarService);

  isPlaying = computed(() => this._controlBarService.isPlaying());

  showNavigation = input<boolean>(true);

  togglePlay = output<void>();
  stepBackward = output<void>();
  stepForward = output<void>();
  previous = output<void>();
  next = output<void>();
}
