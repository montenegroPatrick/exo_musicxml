import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioMixerStateService {
  private readonly _mixerVisible = signal<boolean>(false);

  /** Visibility of the mixer racks console (Readonly) */
  readonly mixerVisible = this._mixerVisible.asReadonly();

  toggleMixer() {
    this._mixerVisible.update(v => !v);
  }
}
