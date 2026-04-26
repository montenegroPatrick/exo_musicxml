import { Injectable } from '@angular/core';
import { 
  Renderer, 
  Stave, 
  StaveNote, 
  Formatter, 
  Beam, 
  Voice,
  SVGContext,
  Annotation,
  Barline,
  Dot
} from 'vexflow';
import { IRhythmNote, ITapResult } from '../interfaces/tap-rythm-vexflow.interface';

@Injectable({
  providedIn: 'root',
})
export class VexflowRendererService {
  /**
   * Converts the custom rhythm codes to VexFlow notes and metadata.
   */
  getNotesFromMeasure(measureStr: string, tempo: number): IRhythmNote[] {
    const codes = measureStr.split(',');
    const notes: IRhythmNote[] = [];
    
    codes.forEach((code) => {
      const rhythmNote = this._mapCodeToNote(code);
      if (rhythmNote) {
        notes.push(rhythmNote);
      }
    });
    
    return notes;
  }

  private _mapCodeToNote(code: string): IRhythmNote | null {
    const c = code; // No toLowerCase to preserve L prefix
    switch (c) {
      // Basic Notes
      case 'r': return { type: c, duration: 'w', isRest: false, expectTap: true, timeMs: 0 };
      case 'b': return { type: c, duration: 'h', isRest: false, expectTap: true, timeMs: 0 };
      case 'n': return { type: c, duration: 'q', isRest: false, expectTap: true, timeMs: 0 };
      case 'c':
      case 'cg':
      case 'cs': return { type: c, duration: '8', isRest: false, expectTap: true, timeMs: 0 };
      case 'dc':
      case 'dcg':
      case 'dcs': return { type: c, duration: '16', isRest: false, expectTap: true, timeMs: 0 };

      // Rests
      case 'p': return { type: c, duration: 'wr', isRest: true, expectTap: false, timeMs: 0 };
      case 'dp': return { type: c, duration: 'hr', isRest: true, expectTap: false, timeMs: 0 };
      case 's': return { type: c, duration: 'qr', isRest: true, expectTap: false, timeMs: 0 };
      case 'ds': return { type: c, duration: '8r', isRest: true, expectTap: false, timeMs: 0 };
      case 'qs': return { type: c, duration: '16r', isRest: true, expectTap: false, timeMs: 0 };

      // Dotted Notes
      case 'rd': return { type: c, duration: 'wd', isRest: false, expectTap: true, timeMs: 0 };
      case 'bd':
      case 'bp': return { type: c, duration: 'hd', isRest: false, expectTap: true, timeMs: 0 };
      case 'nd':
      case 'np': return { type: c, duration: 'qd', isRest: false, expectTap: true, timeMs: 0 };
      case 'cp': return { type: c, duration: '8d', isRest: false, expectTap: true, timeMs: 0 };

      // Tied Notes (L prefix) - No tap expected
      case 'Lr': return { type: c, duration: 'w', isRest: false, expectTap: false, timeMs: 0 };
      case 'Lb': return { type: c, duration: 'h', isRest: false, expectTap: false, timeMs: 0 };
      case 'Ln': return { type: c, duration: 'q', isRest: false, expectTap: false, timeMs: 0 };
      case 'Lbp': return { type: c, duration: 'hd', isRest: false, expectTap: false, timeMs: 0 };
      case 'Lnp': return { type: c, duration: 'qd', isRest: false, expectTap: false, timeMs: 0 };
      case 'Lc':
      case 'Lcg': return { type: c, duration: '8', isRest: false, expectTap: false, timeMs: 0 };

      default:
        console.warn(`[VexflowRendererService]: Unknown rhythm code: ${code}`);
        return null;
    }
  }

  /**
   * Renders all measures into a single Canvas element.
   * Returns a map of theoretical times to X positions for precise cursor/feedback alignment.
   */
  renderAllMeasures(element: HTMLElement, measures: any[], measureWidth: number, tempo: number, feedbacks?: ITapResult[], timeSignature: string = '4/4', clefOffset: number = 85): { timeMs: number, x: number }[] {
    const totalWidth = clefOffset + (measures.length * measureWidth) + 40;
    const notePositions: { timeMs: number, x: number }[] = [];
    
    // 1. Clear the container completely
    element.innerHTML = '';
    
    // 2. Create a clean canvas
    const canvas = document.createElement('canvas');
    element.appendChild(canvas);
    
    try {
      const renderer = new Renderer(canvas, Renderer.Backends.CANVAS);
      renderer.resize(totalWidth, 180);
      const context = renderer.getContext();
      context.clearRect(0, 0, totalWidth, 180);
      
      context.setStrokeStyle('#333333');
      context.setFillStyle('#333333');
      context.setFont('Arial', 10);

      let x = 0;

      // 1. Zone de Clef initiale (85px)
      const clefStave = new Stave(x, 40, clefOffset);
      clefStave.setNumLines(5);
      clefStave.addClef('percussion');
      clefStave.addTimeSignature(timeSignature);
      clefStave.setContext(context).draw();
      x += clefOffset;

      // 2. Mesures de l'exercice
      const msPerBeat = 60000 / tempo;
      const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
      const msPerMeasure = msPerBeat * beatsPerMeasure;

      measures.forEach((m, index) => {
        const stave = new Stave(x, 40, measureWidth);
        stave.setNumLines(5);
        stave.setContext(context).draw();
        
        const notes: IRhythmNote[] = m.notes;
        if (notes && notes.length > 0) {
          const vexNotes: StaveNote[] = [];
          const measureStartTimeMs = index * msPerMeasure;

          notes.forEach((n) => {
            const vn = new StaveNote({
              clef: 'percussion',
              keys: ['a/4'],
              duration: n.duration,
            });
            vn.setStemDirection(1); 
            vn.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
            
            if (n.duration.includes('d')) {
              Dot.buildAndAttach([vn], { all: true });
            }
            vexNotes.push(vn);
          });
          
          const beams = Beam.generateBeams(vexNotes);
          const voice = new Voice({ 
            numBeats: beatsPerMeasure, 
            beatValue: parseInt(timeSignature.split('/')[1]) 
          });
          voice.setStrict(false);
          voice.addTickables(vexNotes);
          
          const availableWidth = measureWidth - 30;
          // Initialisation standard de VexFlow
          new Formatter().joinVoices([voice]).format([voice], availableWidth);
          
          // --- Ajustement Linéaire Strict ---
          notes.forEach((n, nIdx) => {
            const vn = vexNotes[nIdx];
            const timeInMeasure = n.timeMs - measureStartTimeMs;
            const relativeX = (timeInMeasure / msPerMeasure) * availableWidth;
            
            // On écrase la position X du TickContext pour forcer la linéarité
            // (Le TickContext gère le placement relatif au début de la zone de notes de la Stave)
            if (vn.getTickContext()) {
              vn.getTickContext().setX(relativeX);
            }
            
            // On stocke la position absolue réelle pour le composant
            notePositions.push({
              timeMs: n.timeMs,
              x: vn.getAbsoluteX()
            });
          });
          
          // Dessin
          voice.draw(context, stave);

          beams.forEach((b: Beam) => {
            b.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
            b.setContext(context).draw();
          });
        }
        
        x += measureWidth;
      });
    } catch (err) {
      console.error('[VexflowRendererService] Canvas rendering error:', err);
    }

    return notePositions;
  }

  renderMeasure(element: HTMLElement, notes: IRhythmNote[], width: number, isFirst: boolean, feedbacks?: ITapResult[], timeSignature: string = '4/4'): void {
    element.style.width = width + 'px';
    element.style.height = '160px';
    element.style.display = 'block';

    const renderer = new Renderer(element as any, Renderer.Backends.SVG);
    renderer.resize(width, 160);
    const context = renderer.getContext() as SVGContext;
    
    // Clear any previous styles
    context.setStrokeStyle('#000000');
    context.setFillStyle('#000000');
    context.setFont('Arial', 10);

    const stave = new Stave(0, 40, width);
    stave.setNumLines(1);
    stave.addClef('percussion');
    if (isFirst) {
      stave.addTimeSignature(timeSignature);
    }
    
    stave.setContext(context).draw();
    
    if (!notes || notes.length === 0) return;

    const vexNotes: StaveNote[] = [];

    notes.forEach((n) => {
      const vn = new StaveNote({
        clef: 'percussion',
        keys: ['b/4'],
        duration: n.duration,
      });
      
      // Force black color for each note
      vn.setStyle({ fillStyle: 'black', strokeStyle: 'black' });

      // Add dots if necessary
      if (n.duration.includes('d')) {
        Dot.buildAndAttach([vn], { all: true });
      }

      if (feedbacks && !n.isRest) {
         const feedback = feedbacks.find(f => Math.abs(f.expectedTimeMs - n.timeMs) < 100);
         if (feedback) {
            this._addFeedbackDot(vn, feedback);
         }
      }

      vexNotes.push(vn);
    });
    
    const beams = Beam.generateBeams(vexNotes);
    Formatter.FormatAndDraw(context, stave, vexNotes);
    beams.forEach((b: Beam) => {
      b.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
      b.setContext(context).draw();
    });
  }

  private _addFeedbackDot(note: StaveNote, feedback: any): void {
    if (!feedback) return;
    
    const color = feedback.precision === 'perfect' ? '#A3C139' : 
                  feedback.precision === 'good' ? '#FFD700' : '#FA5E46';
    
    // In VexFlow, we can add a text annotation or a custom modifier.
    // For a simple dot, we can use a "dot" character or just a small circle.
    // Let's use a small annotation circle if possible, or just color the note if it's easier.
    // But the screenshot shows a dot BELOW the stave.
    const annotation = new Annotation('|');
    annotation.setVerticalJustification(Annotation.VerticalJustify.BOTTOM);
    annotation.setJustification(Annotation.HorizontalJustify.CENTER);
    annotation.setFont('Arial', 24, 'bold');
    annotation.setStyle({ fillStyle: color, strokeStyle: color });
    note.addModifier(annotation, 0);
  }
}
