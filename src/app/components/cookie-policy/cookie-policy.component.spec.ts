import { TestBed } from "@angular/core/testing";
import { CookiePolicyComponent } from "./cookie-policy.component";

describe('CookiePolicyComponent', () => {
  let component: CookiePolicyComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ CookiePolicyComponent ]
    });

    component = TestBed.inject(CookiePolicyComponent);
  });

  it('initializes', () => {
    expect(component).toBeTruthy();
  })
});
