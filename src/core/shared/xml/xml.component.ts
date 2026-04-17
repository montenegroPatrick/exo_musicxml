import {
  AfterViewInit,
  Component,
  ElementRef,
  effect,
  untracked,
  inject,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { FlatService } from '@core/services/flat.service';
import { AudioService } from '@core/services/audio.service';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';


@Component({
  selector: 'app-xml',
  standalone: true,
  imports: [],
  template: `
    <div class="relative w-full h-full">
      <div class="w-full h-full" #xmlContainer></div>
    </div>
  `,
  styles: ``,
})
export class XmlComponent implements AfterViewInit, OnDestroy {
  private flatService = inject(FlatService);
  private audioService = inject(AudioService);
private diapoService = inject(DiapoStateService);
  xml = input.required<string>();
  xmlContainer = viewChild.required<ElementRef<HTMLDivElement>>('xmlContainer');

   constructor() {
  effect(() => {
    // Cette fonction s'exécutera AUTOMATIQUEMENT à chaque fois que layoutMode() change
    const mode = this.diapoService.layoutMode(); 
    untracked(() => {
        this.flatService.switchLayout();
    });
  });
}

  // Expose service signals
  isXmlReady = this.flatService.isReady;

  async ngAfterViewInit(): Promise<void> {
    // 1. Initialiser le conteneur visuel
    await this.flatService.initEmbed(this.xmlContainer().nativeElement);

    // 2. Charger le XML
    await this.flatService.loadMusicXML(this.xml());
    
    // 3. Enregistrement pour la synchro audio
    this.audioService.registerListener(this.flatService);
  }

  async ngOnChanges(): Promise<void> {
     this.flatService.initEmbed(this.xmlContainer().nativeElement);
  }

  ngOnDestroy(): void {
    this.audioService.unregisterListener(this.flatService);
    this.flatService.destroyEmbed();
  }
}
