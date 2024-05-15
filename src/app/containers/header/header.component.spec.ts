import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { CookieService } from 'ngx-cookie';
import { NavItem, reducers } from '../../store';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture;
  let app;
  const cookieService = jasmine.createSpyObj('cookieSevice', ['get']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('app', reducers)
      ],
      declarations: [
        HeaderComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: CookieService, useValue: cookieService }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    app = fixture.debugElement.componentInstance;
  }));

  it('should create the HeaderComponent', () => {
    expect(app).toBeTruthy();
  });

  it('should emit navigate event', () => {
    spyOn(app.navigate, 'emit');
    app.onNavigate('dummy');
    expect(app.navigate.emit).toHaveBeenCalledWith('dummy');
  });

  it('Service name should be "Approve organisation"', () => {
    app.ngOnInit();
    expect(app.serviceName.name).toBe('Approve organisation');
  });

  describe('updateNavItems', () => {
    it('should update the active navItems', () => {
      const navItems: NavItem = {
        text: 'hello',
        href: 'blah',
        active: false,
        orderId: 1,
        feature: {
          isfeatureToggleable: false,
          featureName: 'string'
        }
      };

      app.navItems = [navItems];

      app.updateNavItems('blah');

      expect(app.navItems[0].active).toBeTruthy();
    });
  });
});
