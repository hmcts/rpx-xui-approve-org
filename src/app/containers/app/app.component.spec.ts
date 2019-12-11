import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { combineReducers, StoreModule, Store } from '@ngrx/store';
import {Logout, reducers} from 'src/app/store';
import { HeaderComponent } from '../header/header.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { cold } from 'jasmine-marbles';

import { AppConstants } from '../../app.constants';
import * as fromRoot from '../../store';



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
