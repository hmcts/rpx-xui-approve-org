import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { UpdatePbaServices } from 'src/org-manager/services';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../store';
import { EditDetailsComponent } from './edit-details.component';

fdescribe('EditDetailsComponent', () => {
  let component: EditDetailsComponent;
  let fixture: ComponentFixture<EditDetailsComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  let updatePbaServices: any;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromOrganisationPendingStore.reducers),
        }),
        ExuiCommonLibModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [{ provide: UpdatePbaServices }],
      declarations: [
        EditDetailsComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
    store = TestBed.get(Store);
    updatePbaServices = TestBed.get(UpdatePbaServices);
    fixture = TestBed.createComponent(EditDetailsComponent);
    component = fixture.componentInstance;
  }));

  it('should have a component', () => {
    expect(component).toBeTruthy();
  });
});
