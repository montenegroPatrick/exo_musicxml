import { Component, computed, inject, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ControlBarService } from '../../services/control-bar.service';

@Component({
  selector: 'app-play-controls',
  imports: [ButtonModule],
  template: `
    <section class="flex gap-1 text-white  rounded-lg">
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
    </section>
  `,
})
export class PlayControlsComponent {
  private _controlBarService = inject(ControlBarService);

  isPlaying = computed(() => this._controlBarService.isPlaying());

  togglePlay = output<void>();
  stepBackward = output<void>();
  stepForward = output<void>();
}
