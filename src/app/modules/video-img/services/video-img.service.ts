import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { IVideoImg } from '../interfaces/video-img.interface';
import { environment } from '@environments/environment';
import { map } from 'rxjs';
import { api_url } from '@core/constant/api_url';
import { ImgType } from '@app/modules/img/interfaces/img.interface';
import { ImgStateService } from '@app/modules/img/services/img.service';

@Injectable({
  providedIn: 'root',
})
export class VideoImgStateService {
  private _videoImgApiService = inject(VideoImgApiService);
  private _imgService = inject(ImgStateService);
  typeImg = signal<ImgType>('eps');
  lessonId = signal<string>('');
  seq = signal<string>('');
  jsonVideo = signal<IVideoImg | null>(null);
  imgUrl = computed(() =>
    this.typeImg() === 'eps'
      ? this.jsonVideo()?.imageList?.[0]?.url
      : this.jsonVideo()?.url,
  );
  getJsonVideoImg() {
    return this._videoImgApiService
      .getJsonVideoImg(this.lessonId(), this.seq())
      .pipe(
        map((data) => {
          this._imgService.initVariables(data);
          this.jsonVideo.set(data);
          return data;
        }),
      );
  }
}
@Injectable({
  providedIn: 'root',
})
export class VideoImgApiService {
  private readonly _lessonUrl = `${api_url.lesson}/`;
  private _http = inject(HttpClient);

  getJsonVideoImg(lessonId: string, seq: string) {
    return this._http.get<IVideoImg>(
      `${this._lessonUrl}${lessonId}/seq/${seq}.json`,
    );
  }
}
