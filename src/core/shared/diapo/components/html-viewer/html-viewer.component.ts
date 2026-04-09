import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-html-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full overflow-hidden">
      @if (safeUrl()) {
        <iframe
          [src]="safeUrl()!"
          class="w-full h-full border-none shadow-sm rounded-md"
          allowfullscreen
        ></iframe>
      } @else {
        <div class="flex items-center justify-center h-full text-muted-foreground italic">
          URL non valide pour l'affichage HTML.
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class HtmlViewerComponent {
  private _sanitizer = inject(DomSanitizer);
  url = input.required<string>();

  safeUrl = computed(() => {
    if (!this.url()) return null;
    return this._sanitizer.bypassSecurityTrustResourceUrl(this.url());
  });
}
