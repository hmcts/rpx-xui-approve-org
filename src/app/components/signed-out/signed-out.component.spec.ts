import { SignedOutComponent } from './signed-out.component';

describe('SignedOutComponent', () => {
  let component: SignedOutComponent;

  beforeEach(() => {
    component = new SignedOutComponent();
    component.ngOnInit();
  });

  it('Is Truthy', () => {
    expect(component).toBeTruthy();
  });

  it('should set the redirectUrl', () => {
    expect(component.redirectUrl).toEqual('./');
  });
});
