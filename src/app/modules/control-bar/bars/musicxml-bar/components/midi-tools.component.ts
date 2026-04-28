import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlatService } from '@core/services/flat.service';

@Component({
  selector: 'app-midi-tools',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './midi-tools.component.html',
  styleUrl: './midi-tools.component.scss'
})
export class MidiToolsComponent {
  private _flatService = inject(FlatService);
  zoom = signal(1.0);
  Math = Math;

  adjustZoom(direction: 'in' | 'out') {
    const current = this.zoom();
    const next = direction === 'in' ? Math.min(2, current + 0.1) : Math.max(0.5, current - 0.1);
    this.zoom.set(next);
    this._flatService.setZoom(next);
  }

  switchLayout() {
    this._flatService.switchLayout();
  }

  print() {
    this._flatService.print();
  }
}
