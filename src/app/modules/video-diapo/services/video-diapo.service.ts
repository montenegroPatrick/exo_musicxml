import { inject, Injectable } from '@angular/core';
import { DiapoStateService } from '../../diapo/services/diapo.service';
import {
  IVideoDiapo,
  IVideoDiapoLayout,
} from '../interfaces/video-diapo.interface';
import { ILesson } from '@core/interfaces/lesson.interface';

@Injectable({
  providedIn: 'root',
})
export class VideoDiapoService {
  private _diapoService = inject(DiapoStateService);

  init(data: IVideoDiapo | ILesson | any) {
    this._diapoService.initVariables(data);
  }
}
