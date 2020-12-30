import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HmctsPrimaryNavigationComponent } from './hmcts-primary-navigation.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie';
import { FeatureToggleService } from '@hmcts/rpx-xui-common-lib';
import { of } from 'rxjs';

describe('HmctsPrimaryNavigationComponent', () => {
  let component: HmctsPrimaryNavigationComponent;
  let fixture: ComponentFixture<HmctsPrimaryNavigationComponent>;
  const cookieService = jasmine.createSpyObj('cookieSevice', ['getObject']);
  const featureToggleService = jasmine.createSpyObj('featureToggleService', ['isEnabled'])
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HmctsPrimaryNavigationComponent ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        { provide: CookieService, useValue: cookieService },
        { provide: FeatureToggleService, useValue: featureToggleService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HmctsPrimaryNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isFeatureNavEnabled$ isfeatureToggleable false', () => {
    const navItem = {
      text:'',
      href: '',
      active: false,
      feature: {
        isfeatureToggleable: false,
        featureName: ''
      },
      orderId: 0
    }
    navItem.feature.isfeatureToggleable = false;
    const result$ = component.isFeatureNavEnabled$(navItem);
    result$.subscribe(result => expect(result).toBeTruthy());
  });

  it('isFeatureNavEnabled$ isfeatureToggleable true but feature is not enabled', () => {
    const navItem = {
      text:'',
      href: '',
      active: false,
      feature: {
        isfeatureToggleable: true,
        featureName: ''
      },
      orderId: 0
    }
    featureToggleService.isEnabled.and.returnValue(of(false))
    const result$ = component.isFeatureNavEnabled$(navItem);
    result$.subscribe(result => expect(result).toBeFalsy());
  });
});
