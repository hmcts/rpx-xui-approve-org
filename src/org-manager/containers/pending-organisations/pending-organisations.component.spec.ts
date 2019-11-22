import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { PendingOrganisationsComponent } from './pending-organisations.component';
import { RouterTestingModule } from '@angular/router/testing';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store/reducers';
import { StoreModule, Store, combineReducers } from '@ngrx/store';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReviewedOrganisationMockCollection } from '../../mock/pending-organisation.mock';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

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
              PendingOrganisationsComponent
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
});
