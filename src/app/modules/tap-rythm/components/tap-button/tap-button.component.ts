import {
  Component,
  ElementRef,
  HostListener,
  viewChild,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { IUserTap } from '../../interface/flat.interface';

@Component({
  selector: 'app-tap-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #tapButton
      [class]="class()"
      (touchstart)="handleTap($event)"
      (mousedown)="handleTap($event)"
      class="cursor-pointer select-none"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class TapButtonComponent {
  readonly disabled = input<boolean>(false);
  readonly lastTap = input<IUserTap | null>(null);
  readonly showFeedback = input<boolean>(true);
  readonly class = input<string>('');
  
  readonly tap = output<Event>();

  private readonly _tapButton = viewChild<ElementRef<HTMLDivElement>>('tapButton');

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.code === 'Space' && !this.disabled()) {
      event.preventDefault();
      this.tap.emit(event);
    }
  }

  handleTap(e: Event): void {
    if (!this.disabled()) {
      e.preventDefault();
      e.stopPropagation();
      this.tap.emit(e);
    }
  }
}
