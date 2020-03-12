import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ManageSessionServices, windowToken } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import {Logout, reducers} from 'src/app/store';
import * as fromRoot from '../../store';
import { HeaderComponent } from '../header/header.component';
import { AppComponent } from './app.component';


const windowMock: Window = { gtag: () => {}} as any;
describe('AppComponent', () => {
  let store: Store<fromRoot.State>;
  const mockManageSessionService = jasmine.createSpyObj('manageSessionServices', ['appStateChanges', 'init']);

  beforeEach(async(() => {
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
        {
          provide: ManageSessionServices,
          useValue: mockManageSessionService
        }
      ],
    }).compileComponents();
    store = TestBed.get(Store);

    spyOn(store, 'dispatch').and.callThrough();
  }));

  it('should create the app', async(() => {
    mockManageSessionService.appStateChanges.and.returnValue(of('keepalive'));
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    expect(app).toBeTruthy();
  }));

  it('should dispatch a logout action', async(() => {
    mockManageSessionService.appStateChanges.and.returnValue(of('keepalive'));
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.onNavigate('sign-out');
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(new Logout());

  }));

});
