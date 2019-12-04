import { OrganisationDetailsComponent } from './organisation-details.component';
import { Store, StoreModule, combineReducers } from '@ngrx/store';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../store';

let component: OrganisationDetailsComponent;
let fixture: ComponentFixture<OrganisationDetailsComponent>;
let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
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
          OrganisationDetailsComponent
        ]
    }).compileComponents();
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(OrganisationDetailsComponent);
    component = fixture.componentInstance;

    it('should have a component', () => {
        expect(component).toBeTruthy();
    });
    }));
});
