import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MidiMixerStateService {
  private readonly _mixerVisible = signal<boolean>(false);

  /** Visibility of the midi mixer console */
  readonly mixerVisible = this._mixerVisible.asReadonly();

  toggleMixer() {
    this._mixerVisible.update(v => !v);
  }
}
