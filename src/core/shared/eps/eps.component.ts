import { Component, input } from '@angular/core';
import { IJsonImgEps } from '@app/modules/img/interfaces/img.interface';

@Component({
  selector: 'app-eps',
  standalone: true,
  imports: [],
  template: ` <p>eps works!</p> `,
  styles: ``,
})
export class EpsComponent {
  eps = input.required<IJsonImgEps>();
}
