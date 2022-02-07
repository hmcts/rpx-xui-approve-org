import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { CookieModule } from 'ngx-cookie';

import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../store';
import { NewPBAsComponent } from './new-pbas.component';


describe('NewPBAsComponent', () => {

  let component: NewPBAsComponent;
  let fixture: ComponentFixture<NewPBAsComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;

  beforeEach((() => {
    TestBed.configureTestingModule({
        imports: [
            StoreModule.forRoot({
                ...fromRoot.reducers,
                feature: combineReducers(fromOrganisationPendingStore.reducers),
            }),
            ExuiCommonLibModule,
            RouterTestingModule,
            CookieModule.forRoot(),
        ],
        declarations: [
          NewPBAsComponent
        ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA
        ],
        providers: [
        ]
    }).compileComponents();
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(NewPBAsComponent);
    component = fixture.componentInstance;

  }));

  it('should have a component', () => {
      expect(component).toBeTruthy();
  });

  it('on go back to active org when the organisation is active', () => {
    const expectedAction = new fromRoot.Go({ path: ['/organisation/pbas']});
    spyOn(store, 'dispatch').and.callThrough();
    component.onGoBack();
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });

});
