import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LessonService } from '@app/modules/lesson/services/lesson.service';

@Component({
  selector: 'app-lesson-metadata',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lesson-metadata.component.html',
  styles: [`
    :host {
      display: block;
      min-width: 0;
    }
  `]
})
export class LessonMetadataComponent {
  private _lessonService = inject(LessonService);

  /**
   * Layout mode:
   * - 'inline': Standard display for desktop control bars
   * - 'popin': Specifically formatted for mobile popin
   */
  layout = input<'inline' | 'popin'>('inline');

  // Metadata Signals
  isDirectMode = this._lessonService.isDirectMode;
  
  // RAW Data
  chapter = this._lessonService.chapter;
  subChapter = this._lessonService.subChapter;
  sequence = this._lessonService.sequence;
  chapterTitle = this._lessonService.chapterTitle;
  subChapterTitle = this._lessonService.subChapterTitle;
  sequenceTitle = this._lessonService.sequenceTitle;

  // Direct Mode Lines
  dirLine1 = this._lessonService.dirLine1;
  dirLine2 = this._lessonService.dirLine2;
  dirLine3 = this._lessonService.dirLine3;
}
