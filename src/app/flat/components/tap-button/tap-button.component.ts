import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
import { IUserTap } from '../../models/tap.model';
import { ExerciseStateService } from '@app/services/exercise-state.service';
import { SoundService } from '@app/services/sound-service.service';

@Component({
  selector: 'app-tap-button',
  standalone: true,
  template: `
    <div #tapButton [class]="class()" (click)="handleTap()">
      <!-- @if (lastTap() && showFeedback()) {
      <p class="text-center text-sm">
        @switch(lastTap()?.result) { @case('Good') { } @case('Too early') {
        <span>En avance de </span>
        } @case('Too late') {
        <span>En retard de </span>
        } } {{ lastTap()?.diffMs }} ms
      </p>
      } -->

      <!-- <button
        #tapButton
        label="TAP"
        icon="pi pi-fingerprint"
        class="h-30 w-65 md:w-100 md:h-75 lg:w-130 lg:h-75 rounded-sm text-xl text-secondary shadow-lg   transition-transform flex flex-col gap-2 items-center justify-center"
        [disabled]="disabled()"
        (click)="handleTap()"
      >
        <p class="select-none">TAP</p>
        @if(screenWidth() > 800) {
        <span class="text-sm select-none"
          >Vous pouvez utiliser la barre espace</span
        >
        }
      </button> -->

      <ng-content></ng-content>
    </div>
  `,
})
export class TapButtonComponent {
  disabled = input<boolean>(false);
  lastTap = input<IUserTap | null>(null);
  showFeedback = input<boolean>(true);
  tap = output<void>();
  class = input<string>('');
  tapButton = viewChild<ElementRef<HTMLButtonElement>>('tapButton');
  screenWidth = computed(() => window.innerWidth);

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Space' && !this.disabled()) {
      event.preventDefault();
      const button = this.tapButton();
      if (button) {
        button.nativeElement.click();
      }
    }
  }

  handleTap = () => {
    if (!this.disabled()) {
      this.tap.emit();
    }
  };
}
