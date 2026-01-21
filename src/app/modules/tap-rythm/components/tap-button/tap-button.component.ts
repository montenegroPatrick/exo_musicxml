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

@Component({
  selector: 'app-tap-button',
  standalone: true,
  template: `
    <div
      #tapButton
      [class]="class()"
      (touchstart)="handleTap($event)"
      (click)="handleTap($event)"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class TapButtonComponent {
  disabled = input<boolean>(false);
  lastTap = input<IUserTap | null>(null);
  showFeedback = input<boolean>(true);
  tap = output<Event>();
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

  handleTap = (e: Event) => {
    if (!this.disabled()) {
      this.tap.emit(e);
    }
  };
}
