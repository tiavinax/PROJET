import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Situation } from "./situation";

describe("Situation", () => {
  let component: Situation;
  let fixture: ComponentFixture<Situation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Situation],
    }).compileComponents();

    fixture = TestBed.createComponent(Situation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
