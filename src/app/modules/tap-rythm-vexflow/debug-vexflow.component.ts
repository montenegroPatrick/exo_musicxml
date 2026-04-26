import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Renderer, Stave, StaveNote, Formatter, Beam, SVGContext } from 'vexflow';

@Component({
  selector: 'app-debug-vexflow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 bg-white h-screen">
      <h1 class="text-2xl font-bold mb-4">Debug VexFlow Rendu</h1>
      <div #vexTarget class="border-2 border-red-500 w-[500px] h-[200px]"></div>
      
      <div class="mt-8 p-4 bg-zinc-100 rounded">
        <p>Si vous voyez un carré rouge vide, le rendu a échoué.</p>
        <p>Si vous voyez une portée avec une noire et un soupir, le rendu fonctionne.</p>
      </div>
    </div>
  `,
})
export class DebugVexflowComponent implements OnInit {
  @ViewChild('vexTarget', { static: true }) vexTarget!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    setTimeout(() => this.renderTest(), 100);
  }

  renderTest(): void {
    try {
      const el = this.vexTarget.nativeElement;
      const renderer = new Renderer(el, Renderer.Backends.SVG);
      renderer.resize(500, 200);
      const context = renderer.getContext() as SVGContext;

      const stave = new Stave(10, 40, 400);
      stave.addClef('treble').addTimeSignature('4/4');
      stave.setContext(context).draw();

      const notes = [
        new StaveNote({ clef: 'treble', keys: ['c/4'], duration: 'q' }),
        new StaveNote({ clef: 'treble', keys: ['d/4'], duration: 'qr' }),
      ];

      Formatter.FormatAndDraw(context, stave, notes);
      console.log('VexFlow Debug: Rendu terminé avec succès');
    } catch (e) {
      console.error('VexFlow Debug: Erreur lors du rendu', e);
    }
  }
}
