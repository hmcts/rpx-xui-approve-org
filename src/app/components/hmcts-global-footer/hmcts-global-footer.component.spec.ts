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

  it('should show the logged-in user email when provided', () => {
    component.loggedInUserEmail = 'logged-in-user@example.com';
    fixture.detectChanges();

    const loggedInUser = fixture.nativeElement.querySelector('footer > .hmcts-width-container > p');
    expect(loggedInUser.textContent).toContain('Logged in as: logged-in-user@example.com');
  });

  it('should not show a logged-in user when an email is not provided', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Logged in as:');
  });
});
