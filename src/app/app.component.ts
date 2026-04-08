import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BridgeService } from '@core/services/bridge.service';
import { LessonService } from './modules/lesson/services/lesson.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'exo_musicxml';
  private _bridgeService = inject(BridgeService); // Initialise le bridge
  private _lessonService = inject(LessonService); // Initialise l'écouteur de leçons
}
