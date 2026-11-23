import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { CookieService } from 'ngx-cookie';
import { navItemsArray } from '../../app.constants';
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
    [
      '/pending-organisations',
      '/organisation',
      '/organisation/pending',
      '/organisation/active',
      '/organisation/pbas',
      '/organisation/pending?page=2#results'
    ].forEach((url) => {
      it(`should select Organisations for ${url}`, () => {
        app.navItems = navItemsArray;
        app.updateNavItems(url);
        expect(app.navItems.map((item) => item.active)).toEqual([true, false]);
      });
    });

    ['/caseworker-details', '/caseworker-details?sort=name'].forEach((url) => {
      it(`should select Staff details for ${url}`, () => {
        app.navItems = navItemsArray;
        app.updateNavItems(url);
        expect(app.navItems.map((item) => item.active)).toEqual([false, true]);
      });
    });

    it('should not select Organisations for an unrelated route', () => {
      app.navItems = navItemsArray;
      app.updateNavItems('/organisation-other');
      expect(app.navItems.every((item) => !item.active)).toBeTrue();
    });

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
