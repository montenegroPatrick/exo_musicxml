import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TapRythmPage } from './tap-rythm.component';

describe('TapRythmPage', () => {
  let component: TapRythmPage;
  let fixture: ComponentFixture<TapRythmPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TapRythmPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TapRythmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
