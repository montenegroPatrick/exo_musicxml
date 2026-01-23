import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  input,
  signal,
  viewChild,
  ViewChild,
} from '@angular/core';
import { IJSONImgXML } from '@app/modules/img/interfaces/img.interface';
import { IJsonXml } from '@app/modules/tap-rythm/interface/flat.interface';
import { environment } from '@environments/environment';
import Embed from 'flat-embed';

@Component({
  selector: 'app-xml',
  imports: [],
  template: ` <div class="w-full h-full" #xmlContainer></div> `,
  styles: ``,
})
export class XmlComponent implements AfterViewInit {
  xml = input.required<string>();
  xmlContainer = viewChild.required<ElementRef<HTMLDivElement>>('xmlContainer');
  isXmlReady = signal(false);
  private embed: Embed | undefined;
  async ngAfterViewInit(): Promise<void> {
    const width = window.innerWidth;
    this.embed = new Embed(this.xmlContainer().nativeElement, {
      embedParams: {
        appId: environment.FLAT_APP_ID,
        controlsDisplay: false,
        playbackMetronome: 'inactive',
        layout: 'responsive',
        zoom: width > 800 ? 'auto' : 1,
        displayFirstLinePartsNames: false,
        hideTempo: true,
      },
    });
    await this.embed.loadMusicXML(this.xml()).then(() => {
      this.isXmlReady.set(true);
    });
    this.embed?.play();
  }
}
