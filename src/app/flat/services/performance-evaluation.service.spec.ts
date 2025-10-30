import { TestBed } from '@angular/core/testing';
import { PerformanceEvaluationService } from './performance-evaluation.service';
import { DEFAULT_DIFFICULTY } from '../models/difficulty.config';

describe('PerformanceEvaluationService', () => {
  let service: PerformanceEvaluationService;
  const windows = DEFAULT_DIFFICULTY.windows;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformanceEvaluationService);
  });

  afterEach(() => {
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('evaluateTap', () => {
    beforeEach(() => {
      service.initializeNotes([1000, 2000, 3000]);
    });

    it('should judge perfect tap within ±20ms', () => {
      const result = service.evaluateTap(1120, windows);
      expect(result.judgment).toBe('perfect');
      expect(result.points).toBe(100);
      expect(result.noteIndex).toBe(0);
    });

    it('should judge great tap within ±50ms', () => {
      const result = service.evaluateTap(1145, windows);
      expect(result.judgment).toBe('great');
      expect(result.points).toBe(80);
      expect(result.noteIndex).toBe(0);
    });

    it('should judge good tap within ±100ms', () => {
      const result = service.evaluateTap(1190, windows);
      expect(result.judgment).toBe('good');
      expect(result.points).toBe(60);
      expect(result.noteIndex).toBe(0);
    });

    it('should judge ok tap within ±150ms', () => {
      const result = service.evaluateTap(1240, windows);
      expect(result.judgment).toBe('ok');
      expect(result.points).toBe(40);
      expect(result.noteIndex).toBe(0);
    });

    it('should return extra tap when outside all windows', () => {
      const result = service.evaluateTap(1360, windows);
      expect(result.judgment).toBe('extra');
      expect(result.points).toBe(0);
      expect(result.noteIndex).toBeNull();
    });

    it('should not double-count same note for multiple taps', () => {
      const result1 = service.evaluateTap(1120, windows);
      expect(result1.noteIndex).toBe(0);
      expect(result1.judgment).toBe('perfect');

      const result2 = service.evaluateTap(1130, windows);
      expect(result2.judgment).toBe('extra');
      expect(result2.noteIndex).toBeNull();
    });

    it('should match to closest note when multiple candidates', () => {
      const result = service.evaluateTap(2050, windows);
      expect(result.noteIndex).toBe(1);
      expect(result.expectedTime).toBe(2000);
    });

    it('should account for audio latency compensation', () => {
      const tapTime = 1120;
      const result = service.evaluateTap(tapTime, windows);
      expect(result.judgment).toBe('perfect');
    });
  });

  describe('evaluateMissedNotes', () => {
    beforeEach(() => {
      service.initializeNotes([1000, 2000, 3000]);
    });

    it('should identify unconsumed notes past timing window', () => {
      const missedTaps = service.evaluateMissedNotes(1350, windows);
      expect(missedTaps.length).toBe(1);
      expect(missedTaps[0].judgment).toBe('miss');
      expect(missedTaps[0].noteIndex).toBe(0);
    });

    it('should not mark future notes as missed', () => {
      const missedTaps = service.evaluateMissedNotes(1100, windows);
      expect(missedTaps.length).toBe(0);
    });

    it('should not mark consumed notes as missed', () => {
      service.evaluateTap(1120, windows);
      const missedTaps = service.evaluateMissedNotes(1350, windows);
      expect(missedTaps.length).toBe(0);
    });

    it('should identify all missed notes at end of exercise', () => {
      service.evaluateTap(1120, windows);
      const missedTaps = service.evaluateMissedNotes(3600, windows);
      expect(missedTaps.length).toBe(2);
    });
  });

  describe('calculateMetrics', () => {
    beforeEach(() => {
      service.initializeNotes([1000, 2000, 3000, 4000]);
    });

    it('should calculate 100% accuracy for all perfect taps', () => {
      const tap1 = service.evaluateTap(1120, windows);
      const tap2 = service.evaluateTap(2120, windows);
      const tap3 = service.evaluateTap(3120, windows);
      const tap4 = service.evaluateTap(4120, windows);

      const metrics = service.calculateMetrics([tap1, tap2, tap3, tap4]);
      expect(metrics.accuracy).toBe(100);
      expect(metrics.perfectCount).toBe(4);
      expect(metrics.totalPoints).toBe(400);
      expect(metrics.maxPoints).toBe(400);
    });

    it('should calculate weighted accuracy with mixed judgments', () => {
      const tap1 = service.evaluateTap(1120, windows);
      const tap2 = service.evaluateTap(2145, windows);
      const tap3 = service.evaluateTap(3190, windows);
      const tap4 = service.evaluateTap(4240, windows);

      const metrics = service.calculateMetrics([tap1, tap2, tap3, tap4]);
      expect(metrics.perfectCount).toBe(1);
      expect(metrics.greatCount).toBe(1);
      expect(metrics.goodCount).toBe(1);
      expect(metrics.okCount).toBe(1);
      expect(metrics.totalPoints).toBe(280);
      expect(metrics.accuracy).toBe(70);
    });

    it('should calculate correct standard deviation', () => {
      const tap1 = service.evaluateTap(1130, windows);
      const tap2 = service.evaluateTap(2120, windows);
      const tap3 = service.evaluateTap(3140, windows);

      const metrics = service.calculateMetrics([tap1, tap2, tap3]);
      expect(metrics.standardDeviation).toBeGreaterThan(0);
    });

    it('should calculate unstable rate (σ × 10)', () => {
      const tap1 = service.evaluateTap(1130, windows);
      const tap2 = service.evaluateTap(2120, windows);

      const metrics = service.calculateMetrics([tap1, tap2]);
      expect(metrics.unstableRate).toBe(metrics.standardDeviation * 10);
    });

    it('should calculate early/late bias', () => {
      const tap1 = service.evaluateTap(1130, windows);
      const tap2 = service.evaluateTap(2130, windows);

      const metrics = service.calculateMetrics([tap1, tap2]);
      expect(metrics.earlyLateBias).toBeGreaterThanOrEqual(0);
    });

    it('should handle missed notes in metrics', () => {
      const tap1 = service.evaluateTap(1120, windows);
      const missedTaps = service.evaluateMissedNotes(4600, windows);

      const metrics = service.calculateMetrics([tap1, ...missedTaps]);
      expect(metrics.perfectCount).toBe(1);
      expect(metrics.missCount).toBe(3);
      expect(metrics.accuracy).toBe(25);
    });

    it('should handle extra taps in metrics', () => {
      const tap1 = service.evaluateTap(1120, windows);
      const tap2 = service.evaluateTap(1600, windows);

      const metrics = service.calculateMetrics([tap1, tap2]);
      expect(metrics.perfectCount).toBe(1);
      expect(metrics.extraTapsCount).toBe(1);
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      service.initializeNotes([1000, 2000]);
      service.evaluateTap(1120, windows);

      service.reset();

      const result = service.evaluateTap(1120, windows);
      expect(result.judgment).toBe('extra');
    });
  });
});
