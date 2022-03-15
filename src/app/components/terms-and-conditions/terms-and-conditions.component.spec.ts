import { TestBed } from "@angular/core/testing";
import { TermsAndConditionsComponent } from "./terms-and-conditions.component";

describe('TermsAndConditionsComponent', () => {
  let component: TermsAndConditionsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ TermsAndConditionsComponent ]
    });

    component = TestBed.inject(TermsAndConditionsComponent);
  });

  it('initializes', () => {
    expect(component).toBeTruthy();
  })
});
