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

  private _lastFlatLayout: 'track' | 'responsive' | 'page' | null = null;
  private _isInitialized = false;

  constructor() {
    effect(() => {
      // Cette fonction s'exécutera AUTOMATIQUEMENT à chaque fois que layoutMode() change
      const mode = this.diapoService.layoutMode(); 
      untracked(async () => {
          if (!this._isInitialized) return;
          
          const newFlatLayout = this.diapoService.getFlatLayout();
          
          // Si le type de layout (track vs responsive) change vraiment, on re-init
          if (this._lastFlatLayout && this._lastFlatLayout !== newFlatLayout) {
              console.log(`[XmlComponent] Layout changed from ${this._lastFlatLayout} to ${newFlatLayout}. Re-initializing embed...`);
              await this.flatService.initEmbed(this.xmlContainer().nativeElement);
              await this.flatService.loadMusicXML(this.xml());
              this._lastFlatLayout = newFlatLayout;
          }
      });
    });
  }

  // Expose service signals
  isXmlReady = this.flatService.isReady;

  async ngAfterViewInit(): Promise<void> {
    // On sauvegarde le layout avec lequel on démarre
    this._lastFlatLayout = this.diapoService.getFlatLayout();

    // 1. Initialiser le conteneur visuel
    await this.flatService.initEmbed(this.xmlContainer().nativeElement);

    // 2. Charger le XML
    await this.flatService.loadMusicXML(this.xml());
    
    // 3. Enregistrement pour la synchro audio
    this.audioService.registerListener(this.flatService);
    
    this._isInitialized = true;
  }

  ngOnDestroy(): void {
    this.audioService.unregisterListener(this.flatService);
    this.flatService.destroyEmbed();
  }
}
