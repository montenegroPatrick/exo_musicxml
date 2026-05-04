import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TapRythmPageComponent } from './tap-rythm.component';

describe('TapRythmPageComponent', () => {
  let component: TapRythmPageComponent;
  let fixture: ComponentFixture<TapRythmPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TapRythmPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TapRythmPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
