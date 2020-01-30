import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {combineReducers, Store, StoreModule} from '@ngrx/store';
import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import {EditDetailsComponent} from './edit-details.component';
import {ReactiveFormsModule} from '@angular/forms';

describe('Edit Details', () => {
  let component: EditDetailsComponent;
  let fixture: ComponentFixture<EditDetailsComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          ...fromOrganisationPendingStore.reducers,
        }),
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
    fixture.detectChanges();
  }));

  it('should create compoent ', () => {
    expect(component).toBeTruthy();
  });

});
