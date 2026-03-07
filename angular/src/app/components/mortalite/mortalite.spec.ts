import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Mortalite } from "./mortalite";

describe("Mortalite", () => {
  let component: Mortalite;
  let fixture: ComponentFixture<Mortalite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mortalite],
    }).compileComponents();

    fixture = TestBed.createComponent(Mortalite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
