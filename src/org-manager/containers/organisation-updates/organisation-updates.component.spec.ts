import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoadingService } from '@hmcts/rpx-xui-common-lib';
import { NgxPaginationModule } from 'ngx-pagination';
import { EMPTY, of } from 'rxjs';
import { SessionStorageService } from '../../../shared/services/session-storage.service';
import { OrganisationAddressComponent } from '../../components/organisation-address';
import { OrganisationVM } from '../../models/organisation';
import { OrganisationService } from '../../services';
import { OrganisationUpdatesComponent } from './organisation-updates.component';

describe('OrganisationUpdatesComponent', () => {
  let fixture: ComponentFixture<OrganisationUpdatesComponent>;
  let component: OrganisationUpdatesComponent;
  let organisationService: jasmine.SpyObj<OrganisationService>;

  beforeEach(async () => {
    organisationService = jasmine.createSpyObj<OrganisationService>('OrganisationService', [
      'paginationParametersReset',
      'organisationSearchStringChange',
      'setOrganisationSearchString',
      'searchOrganisationUpdatesWithPagination'
    ]);
    organisationService.paginationParametersReset.and.returnValue(EMPTY);
    organisationService.organisationSearchStringChange.and.returnValue(EMPTY);
    organisationService.searchOrganisationUpdatesWithPagination.and.returnValue(of({ organisations: [], total_records: 0 }));

    const loadingService = jasmine.createSpyObj<LoadingService>('LoadingService', ['register', 'unregister'], {
      isLoading: of(false)
    });
    const sessionStorageService = jasmine.createSpyObj<SessionStorageService>('SessionStorageService', ['getItem', 'setItem']);
    sessionStorageService.getItem.and.returnValue('');

    await TestBed.configureTestingModule({
      imports: [NgxPaginationModule, RouterTestingModule],
      declarations: [OrganisationUpdatesComponent, OrganisationAddressComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: OrganisationService, useValue: organisationService },
        { provide: LoadingService, useValue: loadingService },
        { provide: SessionStorageService, useValue: sessionStorageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganisationUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialise the organisation updates view', () => {
    expect(component.view).toBe('UPDATES');
    expect(organisationService.setOrganisationSearchString).toHaveBeenCalledOnceWith('');
  });

  it('should render an accessible table and identify each View link', () => {
    component.organisationsLoaded = true;
    component.organisationCount = 1;
    component.pagination = { page_number: 1, page_size: 10 };
    component.organisations = [{
      organisationId: 'ORG-UPDATE-001',
      name: 'Accessible Organisation',
      admin: 'Alex Requester',
      adminEmail: 'alex.requester@example.com',
      addressLine1: '1 Current Street',
      townCity: 'London',
      status: 'PENDING',
      dateRequested: new Date('2026-10-20T12:00:00.000Z')
    } as OrganisationVM];
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    const viewLink = table.querySelector('a') as HTMLAnchorElement;

    expect(table.querySelector('caption').textContent.trim()).toBe('Organisation updates');
    expect(table.querySelectorAll('th[scope="col"]').length).toBe(6);
    expect(viewLink.textContent.replace(/\s+/g, ' ').trim()).toBe('View Accessible Organisation');
    expect(viewLink.getAttribute('href')).toBe('/organisation-update/ORG-UPDATE-001');
  });
});
