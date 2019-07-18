import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { OrgPendingApproveComponent } from './org-pending-approve.component';
import { RouterTestingModule } from '@angular/router/testing';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store/reducers';
import * as fromRootActions from '../../../app/store/actions';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import { of } from 'rxjs';
import { ReviewedOrganisationMockCollection, ActiveOrganisationMockCollection } from '../../mock/pending-organisation.mock';

describe('OrgPendingApproveComponent', () => {
    let component: OrgPendingApproveComponent;
    let fixture: ComponentFixture<OrgPendingApproveComponent>;
    let store: Store<fromOrganisationPendingStore.OrganisationState>;
    let storePipeMock: any;
    let storeDispatchMock: any;
    const reviewedOrganisationsDummy = ReviewedOrganisationMockCollection;
    const activeOrganisationsDummy = ActiveOrganisationMockCollection;

    beforeEach((() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                StoreModule.forRoot({
                    ...fromRoot.reducers,
                    feature: combineReducers(fromOrganisationPendingStore.reducers),
                }),
            ],
            declarations: [
                OrgPendingApproveComponent
            ]
        }).compileComponents();
        store = TestBed.get(Store);

        storePipeMock = spyOn(store, 'pipe');
        storeDispatchMock = spyOn(store, 'dispatch');

        fixture = TestBed.createComponent(OrgPendingApproveComponent);
        component = fixture.componentInstance;
    }));

    it('should return reviewed organisations', () => {
        storePipeMock.and.returnValue(of({reviewedOrganisations: reviewedOrganisationsDummy}));
        fixture.detectChanges();
        expect(component.reviewedOrganisations).toEqual(reviewedOrganisationsDummy);
    });

    xit('should dispatch a router "back" action when there are no reviewed activeOrg', () => {
        storePipeMock.and.returnValue(of({reviewedOrganisations: null}));
        fixture.detectChanges();
        expect(storeDispatchMock).toHaveBeenCalledWith(new fromRootActions.Back());
    });

    xit('should dispatch a pending organisation "approve" action when reviewed activeOrg are approved', () => {
        storePipeMock.and.returnValue(of({reviewedOrganisations: reviewedOrganisationsDummy}));
        fixture.detectChanges();
        component.onApproveOrganisations();
        fixture.detectChanges();
        expect(storeDispatchMock).toHaveBeenCalledWith(
            new fromOrganisationPendingStore.ApprovePendingOrganisations(activeOrganisationsDummy)
        );
    });

});
