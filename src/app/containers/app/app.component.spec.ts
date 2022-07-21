import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RoutesRecognized } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ManageSessionServices, windowToken } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { CookieService } from 'ngx-cookie';
import { of } from 'rxjs';
import { EnvironmentService } from 'src/app/services/environment.service';
import { Logout, reducers, SetModal } from 'src/app/store';
import * as fromRoot from '../../store';
import { HeaderComponent } from '../header/header.component';
import { AppComponent } from './app.component';


const windowMock: Window = { gtag: () => { } } as any;
const idleMockService = jasmine.createSpyObj('idleService', ['appStateChanges']);
const environmentMockService = jasmine.createSpyObj('environmentService', ['getEnv$']);
const cookieService = jasmine.createSpyObj('cookieSevice', ['getObject']);
const titleService = jasmine.createSpyObj('titleService', ['setTitle', 'getTitle']);

describe('AppComponent', () => {
  let store: Store<fromRoot.State>;
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(waitForAsync(() => {
    environmentMockService.getEnv$.and.returnValue(of({}));
    idleMockService.appStateChanges.and.returnValue(of({ type: 'modal' }));
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HeaderComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(
          {
            ...reducers,
            userProfile: combineReducers(fromRoot.reducers)
          })
      ],
      providers: [
        {
          provide: windowToken,
          useValue: windowMock
        },
        { provide: ManageSessionServices, useValue: idleMockService },
        { provide: EnvironmentService, useValue: environmentMockService },
        { provide: CookieService, useValue: cookieService },
        { provide: Title, useValue: titleService }
      ],
    }).compileComponents();
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  }));

  it('should create the app', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('should dispatch a logout action', () => {
    component.onNavigate('sign-out');
    fixture.detectChanges();

    expect(store.dispatch).toHaveBeenCalledWith(new Logout());
  });

  it('should call the title service', () => {
    let testRoute: RoutesRecognized;

    testRoute = new RoutesRecognized(1, 'test', 'test', {
      url: 'test',
      root: {
        firstChild: {
          data: { title: 'Test' },
          url: [],
          params: {},
          queryParams: {},
          fragment: '',
          outlet: '',
          component: '',
          routeConfig: {},
          root: null,
          parent: null,
          firstChild: null,
          children: [],
          pathFromRoot: [],
          paramMap: null,
          queryParamMap: null
        },
        data: { title: 'Test' },
        url: [],
        params: {},
        queryParams: {},
        fragment: '',
        outlet: '',
        component: '',
        routeConfig: {},
        root: null,
        parent: null,
        children: [],
        pathFromRoot: [],
        paramMap: null,
        queryParamMap: null
      }
    });

    component.setTitleIfPresent(testRoute);
    fixture.detectChanges();
    expect(titleService.setTitle).toHaveBeenCalled();
  });

  it('should call the onFocusMainContent method', fakeAsync(() => {
    spyOn(fixture.componentInstance, 'onFocusMainContent');

    const skipLinkElement = fixture.debugElement.nativeElement.querySelector('#skip-link');
    skipLinkElement.click();
    fixture.detectChanges();
    flush();
    expect(component.onFocusMainContent).toHaveBeenCalled();
  }));

  describe('onStaySignedIn', () => {
    it('should dispatch modal action', () => {
      component.onStaySignedIn();

      expect(store.dispatch).toHaveBeenCalledWith(new SetModal({
        session : {
          isVisible: false
        }
      }));
    });
  });
});



