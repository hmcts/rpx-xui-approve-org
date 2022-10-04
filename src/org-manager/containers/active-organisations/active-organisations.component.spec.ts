import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { Store, StoreModule } from '@ngrx/store';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import { FilterOrganisationsPipe } from 'src/org-manager/pipes/filter-organisations.pipe';
import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromOrganisation from '../../../org-manager/store/';
import {ActiveOrganisationsComponent} from './active-organisations.component';

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
        ExuiCommonLibModule
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
