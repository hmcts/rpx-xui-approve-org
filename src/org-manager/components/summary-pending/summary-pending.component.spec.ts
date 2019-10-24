import { ComponentFixture, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { SummaryPendingComponent } from './summary-pending.component';

let component: SummaryPendingComponent;
let fixture: ComponentFixture<SummaryPendingComponent>;
let store: Store<fromOrganisationPendingStore.OrganisationState>;
describe('SummaryPendingComponent', () => {
beforeEach((() => {
    TestBed.configureTestingModule({
        imports: [
            StoreModule.forRoot({
                ...fromRoot.reducers,
                feature: combineReducers(fromOrganisationPendingStore.reducers),
            }),
        ],
        declarations: [
            SummaryPendingComponent
        ]
    }).compileComponents();
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(SummaryPendingComponent);
    component = fixture.componentInstance;

    it('should have a component', () => {
        expect(component).toBeTruthy();
    });
    }));
});
