import {
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  output,
  viewChild,
} from '@angular/core';
import { IUserTap } from '../../models/tap.model';

@Component({
  selector: 'app-tap-button',
  standalone: true,
  template: `
    <div class="flex flex-col gap-2 items-center justify-center">
      @if (lastTap() && showFeedback()) {
      <p class="text-center text-sm">
        @switch(lastTap()?.result) { @case('Good') { } @case('Too early') {
        <span>En avance de </span>
        } @case('Too late') {
        <span>En retard de </span>
        } } {{ lastTap()?.diffMs }} ms
      </p>
      }

      <button
        #tapButton
        label="TAP"
        icon="pi pi-fingerprint"
        class="h-40 w-75 md:w-80 rounded-xl text-xl text-secondary shadow-2xl  active:shadow-inner active:border-1 active:border-primary/50 duration-100 active:scale-95 transition-transform flex flex-col gap-2 items-center justify-center"
        [disabled]="disabled()"
        (click)="handleTap()"
      >
        <p>TAP</p>
        @if(screenWidth() > 800) {
        <span class="text-sm">Vous pouvez utiliser la barre espace</span>
        }
      </button>

      <ng-content></ng-content>
    </div>
  `,
})
export class TapButtonComponent {
  disabled = input<boolean>(false);
  lastTap = input<IUserTap | null>(null);
  showFeedback = input<boolean>(true);
  tap = output<void>();

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

  handleTap() {
    if (!this.disabled()) {
      this.tap.emit();
    }
  }
}
