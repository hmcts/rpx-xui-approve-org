import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../store';
import { EditDetailsComponent } from './edit-details.component';

describe('EditDetailsComponent', () => {
  let component: EditDetailsComponent;
  let fixture: ComponentFixture<EditDetailsComponent>;

  let store = jasmine.createSpyObj('store', ['pipe', 'dispatch']);
  let storeSpy: jasmine.Spy;

  beforeEach((() => {
    TestBed.configureTestingModule({
        imports: [
            StoreModule.forRoot({
                ...fromRoot.reducers,
                feature: combineReducers(fromOrganisationPendingStore.reducers),
            }),
            ExuiCommonLibModule,
            RouterTestingModule,
            FormsModule,
            ReactiveFormsModule
        ],
        declarations: [
          EditDetailsComponent
        ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA
        ]
    }).compileComponents();
    store = TestBed.inject(Store);

    fixture = TestBed.createComponent(EditDetailsComponent);
    component = fixture.componentInstance;

    storeSpy = spyOn(store, 'dispatch').and.callFake(() => {});
  }));

  it('should have a component', () => {
      expect(component).toBeTruthy();
  });

  describe('onGoBack()', () => {
    it('should dispatch a back action to the store', () => {
      component.onGoBack();

      expect(storeSpy).toHaveBeenCalledWith(new fromRoot.Back());
    });
  })
});
