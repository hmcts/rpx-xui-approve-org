import { TestBed } from "@angular/core/testing";
import { NotAuthorisedComponent } from "./not-authorised.component";

describe('NotAuthorisedComponent', () => {
  let component: NotAuthorisedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ NotAuthorisedComponent ]
    });

    component = TestBed.inject(NotAuthorisedComponent);
  });

  it('initializes', () => {
    expect(component).toBeTruthy();
  })
});
