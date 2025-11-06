import { Component, computed, inject, output } from '@angular/core';
import { ExerciseStateService } from '@app/flat/services/exercise-state.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-bottom-buttons',
  imports: [ButtonModule],
  template: `
    <div class="flex flex-row items-center flex-grow gap-4 justify-center">
      <p-button
        styleClass="flex-grow! w-full "
        [icon]="iconButtonListen()"
        [label]="labelButtonListen()"
        variant="outlined"
        severity="secondary"
        (onClick)="handleListen()"
      ></p-button>
      @if(!isListening()) {
      <p-button
        styleClass="flex-grow! w-full "
        icon="pi pi-play"
        label="Commencer"
        severity="secondary"
        variant="outlined"
        (onClick)="handlePlayStop()"
      ></p-button>
      }
    </div>
  `,
  styles: ``,
})
export class BottomButtonsComponent {
  private exerciceState = inject(ExerciseStateService);
  toggleListen = output();
  playStop = output();
  labelButtonListen = computed(() =>
    this.exerciceState.isListening() ? 'Arrêter' : 'Écouter'
  );
  iconButtonListen = computed(() =>
    this.exerciceState.isListening() ? 'pi pi-stop' : 'pi pi-headphones'
  );
  isListening = computed(() => this.exerciceState.isListening());
  handleListen() {
    this.toggleListen.emit();
    //this.exerciceState.toggleListen();
  }

  handlePlayStop() {
    this.playStop.emit();
    //
  }
}
