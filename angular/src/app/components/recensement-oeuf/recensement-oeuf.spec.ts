import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RecensementOeuf } from "./recensement-oeuf";

describe("RecensementOeuf", () => {
  let component: RecensementOeuf;
  let fixture: ComponentFixture<RecensementOeuf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecensementOeuf],
    }).compileComponents();

    fixture = TestBed.createComponent(RecensementOeuf);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
