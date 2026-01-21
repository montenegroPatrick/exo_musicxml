import { inject, Injectable, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { api_url } from '@core/constant/api_url';
import { IVideo } from '../interfaces/video.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private readonly _lessonUrl = api_url.lesson;
  private _http = inject(HttpClient);
  videoJson = signal<IVideo | null>(null);
  getVideoJson({
    seq,
    lessonId,
  }: {
    seq: string;
    lessonId: string;
  }): Observable<IVideo> {
    return this._http
      .get<IVideo>(`${this._lessonUrl}/${lessonId}/seq/${seq}.json`)
      .pipe(
        map((video) => {
          console.log(video);
          this.videoJson.set(video);
          return video;
        }),
      );
  }
}
