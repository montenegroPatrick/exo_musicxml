import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { FlatService } from '@core/services/flat.service';

@Component({
  selector: 'app-xml',
  imports: [],
  template: ` <div class="w-full h-full" #xmlContainer></div> `,
  styles: ``,
})
export class XmlComponent implements AfterViewInit, OnDestroy {
  private flatService = inject(FlatService);

  xml = input.required<string>();
  xmlContainer = viewChild.required<ElementRef<HTMLDivElement>>('xmlContainer');

  // Expose service signals
  isXmlReady = this.flatService.isReady;

  async ngAfterViewInit(): Promise<void> {
    this.flatService.initEmbed(this.xmlContainer().nativeElement);

    await this.flatService.loadMusicXML(this.xml());
    await this.flatService.setTrack();
    await this.flatService.useTrack();
    this.flatService.setupEventListeners();
    await this.flatService.initializeMeasureData();
  }

  ngOnDestroy(): void {
    this.flatService.destroyEmbed();
  }
}
