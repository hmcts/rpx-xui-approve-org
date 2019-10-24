import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import * as fromRootActions from '../../../app/store/actions';
import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { reviewedOrganisationMockCollection } from '../../mock/pending-organisation.mock';
import { OverviewPendingComponent } from './pending-overview.component';

describe('OverviewComponent', () => {
    let component: OverviewPendingComponent;
    let fixture: ComponentFixture<OverviewPendingComponent>;
    let store: Store<fromOrganisationPendingStore.OrganisationState>;
    let storePipeMock: any;
    let storeDispatchMock: any;
    const organisationsDummy = reviewedOrganisationMockCollection;

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
                OverviewPendingComponent
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        }).compileComponents();
        store = TestBed.get(Store);

        storePipeMock = spyOn(store, 'pipe');
        storeDispatchMock = spyOn(store, 'dispatch');

        fixture = TestBed.createComponent(OverviewPendingComponent);
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
