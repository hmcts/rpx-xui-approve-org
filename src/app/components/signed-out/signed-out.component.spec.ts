import { TestBed } from "@angular/core/testing";
import { SignedOutComponent } from "./signed-out.component";

describe('SignedOutComponent', () => {
  let component: SignedOutComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ SignedOutComponent ]
    });

    component = TestBed.inject(SignedOutComponent);
  });

  it('initializes', () => {
    expect(component).toBeTruthy();
  });

  it('should set the redirectUrl on ngOnInit()', () => {
    component.redirectUrl = 'overwrite';

    component.ngOnInit();

    expect(component.redirectUrl).toBe('./');
  });
});
