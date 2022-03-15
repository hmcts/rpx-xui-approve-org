import { TestBed } from "@angular/core/testing";
import { AccessibilityComponent } from "./accessibility.component";

describe('AccessibilityComponent', () => {
  let component: AccessibilityComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ AccessibilityComponent ]
    });

    component = TestBed.inject(AccessibilityComponent);
  });

  it('initializes', () => {
    expect(component).toBeTruthy();
  })
});
