import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { first } from 'rxjs/operators';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  @Component({
    selector: 'app-host-dummy-component',
    template: '<app-footer></app-footer>',
    standalone: false
  })
  class TestDummyHostComponent {
    @ViewChild(FooterComponent)
    public footerComponent: FooterComponent;
  }

  let testHostComponent: TestDummyHostComponent;
  let testHostFixture: ComponentFixture<TestDummyHostComponent>;
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let element: DebugElement;
  const footerData = {
    heading: 'Help',
    email: {
      address: 'service-desk@hmcts.gov.uk',
      text: 'service-desk@hmcts.gov.uk'
    },
    phone: {
      text: '0207 633 4140'
    },
    opening: {
      text: 'Monday to Friday, 8am to 6pm (excluding public holidays)'
    }
  };

  const footerDataNavigation = {
    items: [
      { text: 'Accessibility', href: 'accessibility', target: '_blank' },
      { text: 'Terms and conditions', href: 'terms-and-conditions', target: '_blank' },
      { text: 'Cookies', href: 'cookies', target: '_blank' },
      { text: 'Privacy policy', href: 'privacy-policy', target: '_blank' }
    ]
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [FooterComponent, TestDummyHostComponent],
      providers: [provideMockStore({
        initialState: {
          appState: {
            userDetails: { emailId: 'logged-in-user@example.com' }
          }
        }
      })],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    testHostFixture = TestBed.createComponent(TestDummyHostComponent);
    testHostComponent = testHostFixture.componentInstance;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    element = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be created by angular', () => {
    expect(fixture).not.toBeNull();
  });

  it('should be created by angular', () => {
    expect(component.helpData).toEqual(footerData);
    expect(component.navigationData).toEqual(footerDataNavigation);
  });

  it('should provide the logged-in user email from the store', (done) => {
    component.loggedInUserEmail$.pipe(first()).subscribe((email) => {
      expect(email).toBe('logged-in-user@example.com');
      done();
    });
  });

  it('should identify lower environments', () => {
    expect(component.isLowerEnvironment('administer-orgs.aat.platform.hmcts.net')).toBeTrue();
    expect(component.isLowerEnvironment('administer-orgs.demo.platform.hmcts.net')).toBeTrue();
    expect(component.isLowerEnvironment('administer-orgs.ithc.platform.hmcts.net')).toBeTrue();
    expect(component.isLowerEnvironment('xui-ao-webapp-pr-123.preview.platform.hmcts.net')).toBeTrue();
    expect(component.isLowerEnvironment('localhost')).toBeTrue();
  });

  it('should not identify production as a lower environment', () => {
    expect(component.isLowerEnvironment('administer-orgs.platform.hmcts.net')).toBeFalse();
    expect(component.isLowerEnvironment('administer-orgs.prod.platform.hmcts.net')).toBeFalse();
  });
});
