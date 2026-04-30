import re

with open('src/core/services/flat.service.ts', 'r') as f:
    content = f.read()

# Define the new findTimeByMeasure function
new_func = """  async findTimeByMeasure(position: any, isEnd = false): Promise<number | null> {
    if (!this.embed || !position) {
        return null;
    }
    
    let measureIndex = position.measureIdx;
    let measureUuid = position.measureUuid;

    if (measureIndex === -1 || measureIndex === undefined) {
        console.log('[FlatService] findTimeByMeasure aborted: invalid measureIndex', { position });
        return null;
    }

    let notes: any[] = [];
    if (measureUuid && this._measureNotesCache[measureUuid]) {
      notes = this._measureNotesCache[measureUuid];
    } else if (measureUuid) {
      let index = 0;
      const maxAttempts = 50;
      while (index < maxAttempts) {
        try {
          const noteData = await (this.embed as any).getNoteDetails({
            measureUuid,
            noteIdx: index
          });
          if (!noteData) break;
          notes.push(noteData);
          index++;
          await new Promise(resolve => setTimeout(resolve, 5)); // tiny delay
        } catch (e) { break; }
      }
      this._measureNotesCache[measureUuid] = notes;
    }

    // Now we must find the start or end time using notes or syncPoints
    if (notes.length > 0) {
      if (isEnd) {
         const lastNote = notes[notes.length - 1];
         return lastNote.time + (lastNote.duration || 0);
      }
      return notes[0].time;
    }

    // Fallback if no notes (or no uuid): use _measurePoints array
    const measurePoints = this._getMeasurePoints();
    if (measurePoints && measurePoints.length > measureIndex) {
      let time = measurePoints[measureIndex];
      if (isEnd) {
          if (measureIndex < measurePoints.length - 1) {
              time = measurePoints[measureIndex + 1];
          } else {
              // For the last measure, use the total track time as the end point
              time = this.totalTime() || time;
          }
      }
      return time;
    }

    return null;
  }"""

# Use regex to find and replace the existing findTimeByMeasure function
pattern = r"  async findTimeByMeasure\(position: any, isEnd = false\): Promise<number \| null> \{.*?(?=\n  async syncWithAudio|\n  private _measurePointsCache|\n  // ---)|\n  async findTimeByMeasure.*?\n  async clearSelection"
# We'll use a simpler replacement: from "async findTimeByMeasure" up to the next method, which is "private _measurePointsCache" but wait, is it? Let's check what follows.
