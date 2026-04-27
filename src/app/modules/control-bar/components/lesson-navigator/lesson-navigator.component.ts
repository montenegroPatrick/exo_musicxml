import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BridgeService } from '@core/services/bridge.service';
import { LessonService } from '@app/modules/lesson/services/lesson.service';

@Component({
  selector: 'app-lesson-navigator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-navigator.component.html',
  styleUrls: ['./lesson-navigator.component.scss']
})
export class LessonNavigatorComponent {
  @Input() layout: 'desktop' | 'mobile' = 'desktop';
  @Input() showInfo: boolean = false;
  
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() toggleInfo = new EventEmitter<void>();

  private readonly _bridgeService = inject(BridgeService);
  private readonly _lessonService = inject(LessonService);

  readonly isDirectMode = this._lessonService.isDirectMode;

  handlePrevious(): void {
    if (this.previous.observed) {
      this.previous.emit();
    } else {
      this._bridgeService.sendAction('prev');
    }
  }

  handleNext(): void {
    if (this.next.observed) {
      this.next.emit();
    } else {
      this._bridgeService.sendAction('next');
    }
  }

  onToggleInfo(event: Event): void {
    event.stopPropagation();
    this.toggleInfo.emit();
  }
}
