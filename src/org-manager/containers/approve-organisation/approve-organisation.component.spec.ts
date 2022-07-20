import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { BackLinkComponent } from 'src/org-manager/components';
import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { ActiveOrganisationMockCollection, ReviewedOrganisationMockCollection } from '../../mock/pending-organisation.mock';
import { ApproveOrganisationComponent } from './approve-organisation.component';

describe('ApproveOrganisationComponent', () => {
    let component: ApproveOrganisationComponent;
    let fixture: ComponentFixture<ApproveOrganisationComponent>;
    let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
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
                BackLinkComponent,
                ApproveOrganisationComponent
            ]
        }).compileComponents();
        store = TestBed.get(Store);

        storePipeMock = spyOn(store, 'pipe');
        storeDispatchMock = spyOn(store, 'dispatch');

        fixture = TestBed.createComponent(ApproveOrganisationComponent);
        component = fixture.componentInstance;
    }));

    it('should return reviewed organisations', () => {
        storePipeMock.and.returnValue(of({reviewedOrganisations: reviewedOrganisationsDummy}));
        fixture.detectChanges();
        expect(component.orgForReview['reviewedOrganisations']).toEqual(reviewedOrganisationsDummy);
    });

    it('should dispatch a pending organisation "approve" action when reviewed activeOrg are approved', () => {
        storePipeMock.and.returnValue(of({reviewedOrganisations: reviewedOrganisationsDummy}));
        fixture.detectChanges();
        component.onApproveOrganisations();
        fixture.detectChanges();
        expect(component.disabled).toBeFalsy();
    });

});
