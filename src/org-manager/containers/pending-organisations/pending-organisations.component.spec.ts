import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { PendingOrganisations } from './pending-organisations.component';
import { RouterTestingModule } from '@angular/router/testing';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store/reducers';
import * as fromRootActions from '../../../app/store/actions';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReviewedOrganisationMockCollection, ReviewedOrganisationFromGovTableMockCollection } from '../../mock/pending-organisation.mock';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

describe('ActiveOrganisationsComponent', () => {
    let component: PendingOrganisations;
    let fixture: ComponentFixture<PendingOrganisations>;
    let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
    let storePipeMock: any;
    let storeDispatchMock: any;
    const organisationsDummy = ReviewedOrganisationMockCollection;
    const organisationsFromGovTableDummy = ReviewedOrganisationFromGovTableMockCollection;

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
                PendingOrganisations
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        }).compileComponents();
        store = TestBed.get(Store);

        storePipeMock = spyOn(store, 'pipe');
        storeDispatchMock = spyOn(store, 'dispatch');

        fixture = TestBed.createComponent(PendingOrganisations);
        component = fixture.componentInstance;
        storePipeMock.and.returnValue(of({ pendingOrganisations: organisationsDummy }));
        fixture.detectChanges();
    }));

    it('should dispatch a router back action when back clicked', () => {
        component.onGoBack();
        expect(storeDispatchMock).toHaveBeenCalledWith(
            new fromRootActions.Back()
        );
    });

});
