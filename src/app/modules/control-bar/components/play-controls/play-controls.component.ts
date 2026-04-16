import { Component, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ControlBarService } from '../../services/control-bar.service';
import { LessonService } from '../../../lesson/services/lesson.service';

@Component({
  selector: 'app-play-controls',
  standalone: true,
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './play-controls.component.html'
})
export class PlayControlsComponent {
  private _controlBarService = inject(ControlBarService);
  private _lessonService = inject(LessonService);

  // -- Signals mapping --
  isPlaying = this._controlBarService.isPlaying;
  isDirectMode = this._lessonService.isDirectMode;

  // -- Event Emitters --
  togglePlay = output<void>();
  stepBackward = output<void>();
  stepForward = output<void>();
  previous = output<void>();
  next = output<void>();
}
