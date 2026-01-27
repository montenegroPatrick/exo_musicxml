import { Component, computed, inject, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ControlBarService } from '../../../../services/control-bar.service';

@Component({
  selector: 'app-play-controls',
  imports: [ButtonModule],
  template: `
    <section class="flex gap-2 bg-black/40 px-4 py-1 rounded-lg">
      <p-button
        icon="pi pi-step-backward"
        [text]="true"
        severity="secondary"
        (onClick)="stepBackward.emit()"
      />
      <p-button
        [icon]="isPlaying() ? 'pi pi-pause' : 'pi pi-play'"
        [text]="true"
        severity="secondary"
        (onClick)="togglePlay.emit()"
      />
      <p-button
        icon="pi pi-step-forward"
        [text]="true"
        severity="secondary"
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
