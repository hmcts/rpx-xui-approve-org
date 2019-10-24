import { ComponentFixture, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { SummaryComponent } from './summary.component';

let component: SummaryComponent;
let fixture: ComponentFixture<SummaryComponent>;
let store: Store<fromOrganisationPendingStore.OrganisationState>;
describe('SummaryComponent', () => {
beforeEach((() => {
    TestBed.configureTestingModule({
        imports: [
            StoreModule.forRoot({
                ...fromRoot.reducers,
                feature: combineReducers(fromOrganisationPendingStore.reducers),
            }),
        ],
        declarations: [
            SummaryComponent
        ]
    }).compileComponents();
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(SummaryComponent);
    component = fixture.componentInstance;

    it('should have a component', () => {
        expect(component).toBeTruthy();
    });
    }));
});
