import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AccessDeniedComponent } from './access-denied.component';

describe('AccessDeniedComponent', () => {
  let component: AccessDeniedComponent;
  let fixture: ComponentFixture<AccessDeniedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AccessDeniedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should show the access denied content', () => {
    const headingElement = fixture.debugElement.query(By.css('.govuk-heading-xl')).nativeElement;
    const bodyElements = fixture.debugElement.queryAll(By.css('.govuk-body'));

    expect(headingElement.textContent).toContain('You cannot use Manage Cases with this account');
    expect(bodyElements[0].nativeElement.textContent).toContain(
      'You signed in successfully, but this account is not authorised to use Manage Cases.'
    );
    expect(bodyElements[1].nativeElement.textContent).toContain('Sign in with a different account');
    expect(bodyElements[1].nativeElement.textContent).toContain(
      'or contact your service/onboarding support team if you need access.'
    );
  });
});
