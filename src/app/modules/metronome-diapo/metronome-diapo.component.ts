import { Component, ChangeDetectionStrategy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiapoComponent } from '@core/shared/diapo/diapo.component';

@Component({
  selector: 'app-metronome-diapo',
  standalone: true,
  imports: [CommonModule, DiapoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.h-full]': '!isMobile()',
    '[class.h-auto]': 'isMobile()',
    'class': 'block w-full'
  },
  template: `
    <div class="w-full bg-zinc-950 relative" 
         [ngClass]="isMobile() ? 'h-auto overflow-visible' : 'h-full overflow-hidden'">
      <app-diapo theme="dark" class="block w-full h-full"></app-diapo>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MetronomeDiapoComponent {
  private readonly _isMobile = signal<boolean>(window.innerWidth < 768);
  readonly isMobile = this._isMobile.asReadonly();

  @HostListener('window:resize')
  onResize(): void {
    this._isMobile.set(window.innerWidth < 768);
  }
}
