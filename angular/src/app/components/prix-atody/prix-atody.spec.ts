import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PrixAtody } from "./prix-atody";

describe("PrixAtody", () => {
  let component: PrixAtody;
  let fixture: ComponentFixture<PrixAtody>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrixAtody],
    }).compileComponents();

    fixture = TestBed.createComponent(PrixAtody);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
