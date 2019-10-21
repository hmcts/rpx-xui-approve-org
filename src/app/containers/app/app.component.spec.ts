import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { Logout, reducers } from 'src/app/store';
import * as fromRoot from '../../store';
import { HeaderComponent } from '../header/header.component';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let store: Store<fromRoot.State>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HeaderComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        StoreModule.forRoot(
          {
            ...reducers,
            userProfile: combineReducers(fromRoot.reducers)
          })
      ]
    }).compileComponents();
    store = TestBed.get(Store);

    spyOn(store, 'dispatch').and.callThrough();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);

    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    expect(app).toBeTruthy();
  }));

  it('should dispatch a logout action', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.onNavigate('sign-out');
    fixture.detectChanges();

    expect(store.dispatch).toHaveBeenCalledWith(new Logout());

  }));

});
