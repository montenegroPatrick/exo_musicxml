import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { KnobComponent } from '../../../../audiomixer/components/knob/knob.component';

@Component({
  selector: 'app-shared-mixer-strip',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SliderModule, KnobComponent],
  templateUrl: './mixer-strip.component.html',
  styleUrls: ['./mixer-strip.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedMixerStripComponent {
  label = input.required<string>();
  volume = input.required<number>();
  pan = input<number>(0);
  mute = input<boolean>(false);
  solo = input<boolean>(false);
  isMaster = input<boolean>(false);
  trackLabelColor = input<string>('#3f3f46');
  showMeter = input<boolean>(false);

  volumeChange = output<number>();
  panChange = output<number>();
  muteToggle = output<void>();
  soloToggle = output<void>();

  onVolumeChange(val: number) { this.volumeChange.emit(val); }
  onPanChange(val: number) { this.panChange.emit(val); }
  onMuteClick() { this.muteToggle.emit(); }
  onSoloClick() { this.soloToggle.emit(); }
}
