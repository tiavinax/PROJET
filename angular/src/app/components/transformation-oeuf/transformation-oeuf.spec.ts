import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TransformationOeuf } from "./transformation-oeuf";

describe("TransformationOeuf", () => {
  let component: TransformationOeuf;
  let fixture: ComponentFixture<TransformationOeuf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransformationOeuf],
    }).compileComponents();

    fixture = TestBed.createComponent(TransformationOeuf);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
