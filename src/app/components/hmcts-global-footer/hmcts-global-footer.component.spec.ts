import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppConstants } from '../../app.constants';
import { Helper, Navigation } from '../../containers/footer/footer.model';
import { HmctsGlobalFooterComponent } from './hmcts-global-footer.component';

describe('HmctsGlobalFooterComponent', () => {
  let component: HmctsGlobalFooterComponent;
  let fixture: ComponentFixture<HmctsGlobalFooterComponent>;

  const helpData: Helper = AppConstants.FOOTER_DATA;
  const navigationData: Navigation = AppConstants.FOOTER_DATA_NAVIGATION;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [HmctsGlobalFooterComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HmctsGlobalFooterComponent);
    component = fixture.componentInstance;
    component.help = helpData;
    component.navigation = navigationData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be created by angular', () => {
    expect(fixture).not.toBeNull();
  });

  it('should display the GOV.UK crown', () => {
    const crown = fixture.nativeElement.querySelector('.govuk-footer__crown');
    expect(crown).not.toBeNull();
  });

  it('should display the logged-in user email when supplied', () => {
    component.loggedInUserEmail = 'logged-in-user@example.com';
    fixture.detectChanges();

    const loggedInUser = fixture.nativeElement.querySelector('footer p');
    expect(loggedInUser.textContent).toContain('Logged in as: logged-in-user@example.com');
  });

  it('should hide the logged-in user email when it is not supplied', () => {
    expect(fixture.nativeElement.querySelector('footer p')).toBeNull();
  });

  it('should display the Open Government Licence statement', () => {
    const licenceLogo = fixture.nativeElement.querySelector('.govuk-footer__licence-logo');
    const licenceDescription = fixture.nativeElement.querySelector('.govuk-footer__licence-description');
    const licenceLink = licenceDescription.querySelector('a');
    const licenceText = licenceDescription.textContent.replace(/\s+/g, ' ').trim();

    expect(licenceLogo).not.toBeNull();
    expect(licenceLogo.getAttribute('aria-hidden')).toBe('true');
    expect(licenceText).toBe(
      'All content is available under the Open Government Licence v3.0, except where otherwise stated'
    );
    expect(licenceLink.getAttribute('href')).toBe(
      'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
    );
    expect(licenceLink.getAttribute('rel')).toBe('license');
  });
});
