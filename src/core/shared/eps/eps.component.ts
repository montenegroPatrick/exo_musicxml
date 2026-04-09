import { Component, computed, inject, input } from '@angular/core';
import { IJsonDiapoEps } from '@core/shared/diapo/interfaces/diapo.interface';
import { CommonModule } from '@angular/common';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';

@Component({
  selector: 'app-eps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center w-full h-full">
      @if (currentImage()) {
        <img 
          [src]="currentImage()?.fullUrl" 
          class="shadow-lg rounded transition-all duration-500 ease-in-out"
          [ngClass]="{
            'max-w-full max-h-full object-contain h-full': viewMode() === 'fit',
            'w-full h-auto': viewMode() === 'zoom'
          }"
          alt="Diapo Image"
        >
      } @else {
        <div class="text-zinc-400">Aucune image sélectionnée</div>
      }
    </div>
  `,
})
export class EpsComponent {
  private _diapoService = inject(DiapoStateService);
  viewMode = computed(() => this._diapoService.viewMode());
  eps = input.required<IJsonDiapoEps>();

  /**
   * Calculates the image folder based on screen ratio and resolution,
   * matching the legacy AngularJS pluginFactory.js logic.
   */
  imageFolder = computed(() => {
    const screenWidth = Math.max(window.screen.width, window.screen.height);
    const screenHeight = Math.min(window.screen.width, window.screen.height);
    const ratio = Math.floor((screenWidth / screenHeight) * 1000) / 1000;

    let ratioLabel = '16x9';
    if (ratio >= 1.77) {
      ratioLabel = '16x9';
    } else if (ratio >= 1.6) {
      ratioLabel = '16x10';
    } else if (ratio >= 1.3) {
      ratioLabel = '4x3';
    }

    const imgName = screenWidth <= 1280 ? '1280' : '2560';
    return `${ratioLabel}/${imgName}`;
  });

  currentImage = computed(() => {
    const data = this.eps();
    if (data.imageList && data.imageList.length > 0) {
      // Use the pos if available (1-indexed), else the first one
      const idx = (data.pos ?? 1) - 1;
      const img = data.imageList[idx] || data.imageList[0];

      if (img) {
        // Construct the full URL: base + folder + ext
        return {
          ...img,
          fullUrl: `${img.url}${this.imageFolder()}${img.ext}`,
        };
      }
    }
    return null;
  });
}
