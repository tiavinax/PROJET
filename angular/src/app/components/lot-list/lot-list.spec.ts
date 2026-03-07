import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotList } from './lot-list';

describe('LotList', () => {
  let component: LotList;
  let fixture: ComponentFixture<LotList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
