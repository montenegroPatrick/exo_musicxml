import { environment } from '@environments/environment';

export const root: string = environment.api_url;
export const api_url = {
  data: `${root}/app/datas/`,
  exoMusicXml: `${root}/app/datas/xmlExo/`,
  lesson: `${root}/app/datas/lesson/`,
};
