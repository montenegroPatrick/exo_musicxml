import { Component, computed, input } from '@angular/core';
import { IJsonDiapoEps } from '@app/modules/diapo/interfaces/diapo.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center w-full h-full">
      @if (currentImage()) {
        <img 
          [src]="currentImage()?.url" 
          class="max-w-full max-h-full object-contain shadow-lg rounded"
          alt="Diapo Image"
        >
      } @else {
        <div class="text-zinc-400">Aucune image sélectionnée</div>
      }
    </div>
  `,
})
export class EpsComponent {
  eps = input.required<IJsonDiapoEps>();

  currentImage = computed(() => {
    const data = this.eps();
    if (data.imageList && data.imageList.length > 0) {
      // Use the pos if available (1-indexed), else the first one
      const idx = (data.pos ?? 1) - 1;
      return data.imageList[idx] || data.imageList[0];
    }
    return null;
  });
}
