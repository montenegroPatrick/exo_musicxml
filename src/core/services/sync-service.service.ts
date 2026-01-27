import { computed, inject, Injectable, signal } from '@angular/core';
import { JwpService } from './jwp.service';
import { FlatService } from './flat.service';
export type mediaType = 'videoXml' | 'video' | 'audioXml';
@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private _mediaType = signal<mediaType>('videoXml');
  private _jwpService = inject(JwpService);
  private _flatService = inject(FlatService);
  private _time = signal<number>(0);
}
