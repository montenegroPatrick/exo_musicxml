import { Component, inject, input } from '@angular/core';
import { XmlComponent } from '@core/shared/xml/xml.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-xml-viewer',
  standalone: true,
  imports: [CommonModule, XmlComponent],
  template: `
    <div class="w-full h-full p-2 bg-white rounded-lg shadow-inner overflow-hidden">
      @if (xml()) {
        <app-xml [xml]="xml()"></app-xml>
      } @else {
        <div class="flex items-center justify-center h-full text-muted-foreground">
          Chargement de la partition...
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
export class XmlViewerComponent {
  xml = input.required<string>();
}
