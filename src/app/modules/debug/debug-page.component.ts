import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-debug-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, ListboxModule, CardModule, FormsModule],
  templateUrl: './debug-page.component.html',
  styleUrl: './debug-page.component.scss'
})
export class DebugPageComponent {
  private router = inject(Router);

  jsonFiles = [
    'images',
    'img-pdf',
    'lesson_playback_xml',
    'lesson_playback_xml2',
    'lesson_playback_xml_noNav',
    'playback',
    'score_xml_audiomixer',
    'tapRythmVexFlowNav',
    'tapRythmVexFlowNoNav',
    'video-img-eps-sync',
    'video-img-pdf',
    'video-img-xml-sync',
    'video',
    'videoImg',
    'videoNN'
  ];

  availableRoutes = [
    'video',
    'video-diapo',
    'video-score',
    'playback-score',
    'playback-diapo',
    'diapo',
    'tap-rythm',
    'music-xml',
    'drummachine',
    'metronome'
  ];

  selectedJson: string | null = null;
  currentHoverRoute = signal<string | null>(null);

  navigateTo(route: string) {
    if (this.selectedJson) {
      this.router.navigate([route], { queryParams: { mock: this.selectedJson } });
    }
  }

  setHoverRoute(route: string | null) {
    this.currentHoverRoute.set(route);
  }
}
