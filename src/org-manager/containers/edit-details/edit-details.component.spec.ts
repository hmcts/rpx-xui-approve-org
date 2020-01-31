import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../store';
import { EditDetailsComponent } from './edit-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



describe('EditDetailsComponent', () => {
  let component: EditDetailsComponent;
  let fixture: ComponentFixture<EditDetailsComponent>;
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
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(EditDetailsComponent);
    component = fixture.componentInstance;

  }));

  it('should have a component', () => {
      expect(component).toBeTruthy();
  });

});
