import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotForm } from './lot-form';

describe('LotForm', () => {
  let component: LotForm;
  let fixture: ComponentFixture<LotForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
