import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { FilterOrganisationsPipe } from 'src/org-manager/pipes/filter-organisations.pipe';

import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromOrganisation from '../../../org-manager/store/';
import { PendingOrganisationsComponent } from './pending-organisations.component';

describe('PendingOrganisationComponent', () => {
    let component: PendingOrganisationsComponent;
    let fixture: ComponentFixture<PendingOrganisationsComponent>;
    let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
    beforeEach((() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                ReactiveFormsModule,
                StoreModule.forRoot({
                    ...fromRoot.reducers,
                    feature: combineReducers(fromOrganisationPendingStore.reducers),
                }),
            ],
            providers: [FormBuilder],
            declarations: [
              PendingOrganisationsComponent, FilterOrganisationsPipe
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        }).compileComponents();
        store = TestBed.get(Store);

        fixture = TestBed.createComponent(PendingOrganisationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should dispatch UpdatePendingOrganisationsSearchString action on submitSearch', () => {
      const expectedAction = new fromOrganisation.UpdatePendingOrganisationsSearchString('');
      spyOn(store, 'dispatch').and.callThrough();
      component.submitSearch('');
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
