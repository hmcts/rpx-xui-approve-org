import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import { FilterOrganisationsPipe } from 'src/org-manager/pipes/filter-organisations.pipe';
import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromOrganisation from '../../../org-manager/store/';
import { PendingOrganisationsComponent } from './pending-organisations.component';

const mockOrganisations = [1, 2, 3, 4].map(id => {
  const org: OrganisationVM = {
    organisationId: id.toString(),
    status: '',
    admin: '',
    adminEmail: '',
    addressLine1: '',
    addressLine2: '',
    townCity: '',
    county: '',
    name: '',
    view: '',
    pbaNumber: ['PBA'],
    dxNumber: ['DX']
  };

  return org;
});

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
        ExuiCommonLibModule
      ],
      providers: [FormBuilder],
      declarations: [
        PendingOrganisationsComponent, FilterOrganisationsPipe
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

  it('should dispatch UpdatePendingOrganisationsSearchString action on submitSearch', () => {
    const expectedAction = new fromOrganisation.UpdatePendingOrganisationsSearchString('');
    spyOn(store, 'dispatch').and.callThrough();
    component.submitSearch('');
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });


  describe('emitPageClickEvent()', () => {
    it('should set the current page number', () => {
      component.emitPageClickEvent(12);

      expect(component.pagination.currentPage).toEqual(12);
    });
  });

  describe('getLastResult()', () => {
    it('should return 0 when org array is empty', () => {
      const result = component.getLastResult([]);

      expect(result).toEqual(0);
    });

    it('should get the last result in array', () => {
      const result = component.getLastResult(mockOrganisations);

      expect(result).toEqual(4);
    });
  });

  describe('getFirstResult()', () => {
    it('should return 0 when org array is empty', () => {
      const result = component.getFirstResult([]);

      expect(result).toEqual(0);
    });

    it('should get the first result in array', () => {
      const result = component.getFirstResult(mockOrganisations);

      expect(result).toEqual(1);
    });

    it('should get the first result when pagination current page not initialised', () => {
      component.pagination.currentPage = null;
      const result = component.getFirstResult(mockOrganisations);

      expect(result).toEqual(1);
    });

    it('should get the first result in on page', () => {
      component.pagination.currentPage = 2;
      component.pagination.itemsPerPage = 2;
      const result = component.getFirstResult(mockOrganisations);

      expect(result).toEqual(3);
    });
  });

  describe('getTotalResults()', () => {
    it('should return 0 when org array is empty', () => {
      const result = component.getTotalResults([]);

      expect(result).toEqual(0);
    });

    it('should get the first result in array', () => {
      const result = component.getTotalResults(mockOrganisations);

      expect(result).toEqual(4);
    });
  });
});
