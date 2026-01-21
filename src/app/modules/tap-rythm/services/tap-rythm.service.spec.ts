import { TestBed } from '@angular/core/testing';

import { TapRythmService } from './tap-rythm.service';

describe('TapRythmService', () => {
  let service: TapRythmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TapRythmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
