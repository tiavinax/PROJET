import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PrixSakafo } from "./prix-sakafo";

describe("PrixSakafo", () => {
  let component: PrixSakafo;
  let fixture: ComponentFixture<PrixSakafo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrixSakafo],
    }).compileComponents();

    fixture = TestBed.createComponent(PrixSakafo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
