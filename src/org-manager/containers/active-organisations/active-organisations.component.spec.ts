import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import { FilterOrganisationsPipe } from 'src/org-manager/pipes/filter-organisations.pipe';
import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromOrganisation from '../../../org-manager/store/';
import {ActiveOrganisationsComponent} from './active-organisations.component';

describe('Active Organisation', () => {
  let component: ActiveOrganisationsComponent;
  let fixture: ComponentFixture<ActiveOrganisationsComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          ...fromRoot.reducers
        }),
      ],
      declarations: [
        ActiveOrganisationsComponent, FilterOrganisationsPipe
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(ActiveOrganisationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create compoent ', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch UpdateActiveOrganisationsSearchString action on submitSearch', () => {
    const expectedAction = new fromOrganisation.UpdateActiveOrganisationsSearchString('');
    spyOn(store, 'dispatch').and.callThrough();
    component.submitSearch('');
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });
});