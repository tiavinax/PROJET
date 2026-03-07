import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SuiviPoids } from "./suivi-poids";

describe("SuiviPoids", () => {
  let component: SuiviPoids;
  let fixture: ComponentFixture<SuiviPoids>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuiviPoids],
    }).compileComponents();

    fixture = TestBed.createComponent(SuiviPoids);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
