import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { OrgPendingApproveComponent } from './org-pending-approve.component';
import { RouterTestingModule } from '@angular/router/testing';
import * as fromOrganisationPendingStore from '../../../org-pending/store';
import * as fromRoot from '../../../app/store/reducers';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import { of } from 'rxjs';

const reviewedOrganisationsDummy = [{
    name: 'dummy 1',
    organisationId: 'dummy 1',
    address: 'dummy 1',
    pbaNumber: 'dummy 1',
    admin: 'dummy 1',
    status: 'dummy 1',
    view: 'dummy 1',
    id: 'dummy 1',
    email: 'dummy 1'
}];

fdescribe('OrgPendingApproveComponent', () => {
    let component: OrgPendingApproveComponent;
    let fixture: ComponentFixture<OrgPendingApproveComponent>;
    let store: Store<fromOrganisationPendingStore.PendingOrganisationState>;

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

        spyOn(store, 'pipe').and.returnValue(of({reviewedOrganisations: reviewedOrganisationsDummy}));

        fixture = TestBed.createComponent(OrgPendingApproveComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should return reviewed organisations', () => {
        expect(component.reviewedOrganisations).toEqual(reviewedOrganisationsDummy);
    });

});
