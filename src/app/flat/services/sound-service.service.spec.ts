import { TestBed } from '@angular/core/testing';

import { SoundService } from '../../../core/services/utils/sound-service.service';

describe('SoundServiceService', () => {
  let service: SoundService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
