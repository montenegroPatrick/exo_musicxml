import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trackTime',
  standalone: true
})
export class TrackTimePipe implements PipeTransform {
  transform(seconds: number | null): string {
    if (seconds === null || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
