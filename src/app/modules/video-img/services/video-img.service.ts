import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { IVideoImg } from '../interfaces/video-img.interface';
import { environment } from '@environments/environment';
import { map } from 'rxjs';
import { api_url } from '@core/constant/api_url';
import { ImgType } from '@app/modules/img/interfaces/img.interface';
import { ImgStateService } from '@app/modules/img/services/img.service';
import { LessonService } from '@app/modules/lesson/services/lesson.service';

@Injectable({
  providedIn: 'root',
})
export class VideoImgStateService {
  private _videoImgApiService = inject(VideoImgApiService);
  private _imgService = inject(ImgStateService);
  private _lessonService = inject(LessonService);
  typeImg = signal<ImgType>('eps');
  lessonId = signal<string>('');
  seq = signal<string>('');

  imgUrl = computed(() =>
    this.typeImg() === 'eps'
      ? this._lessonService.lessonJson()?.imageList?.[0]?.url
      : this._lessonService.lessonJson()?.url,
  );
}
@Injectable({
  providedIn: 'root',
})
export class VideoImgApiService {
  private readonly _lessonUrl = `${api_url.lesson}/`;
  private _http = inject(HttpClient);
}
