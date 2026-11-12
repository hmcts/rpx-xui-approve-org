import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { of } from 'rxjs';
import { OrganisationService, PbaService } from '../../services';
import { PendingPBAsComponent } from './pending-pbas.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PendingPBAsComponent', () => {
  let component: PendingPBAsComponent;
  let fixture: ComponentFixture<PendingPBAsComponent>;
  let router: Router;
  const pbaServiceSpy = jasmine.createSpyObj('PbaService', ['setPBAStatus', 'searchPbasWithPagination']);

  beforeEach(() => {
    router = jasmine.createSpyObj('router', ['navigate']);
    TestBed.configureTestingModule({
      declarations: [
        PendingPBAsComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule,
        ExuiCommonLibModule],
      providers: [
        { provide: PbaService, useValue: pbaServiceSpy },
        OrganisationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingPBAsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  describe('loading organisations', () => {
    const organisation = {
      organisationIdentifier: 'ORG123',
      organisationName: 'Test organisation',
      pbaNumbers: [{ pbaNumber: 'PBA1231231', dateCreated: '2022-02-21T09:10:11.000Z' }],
      superUser: { firstName: 'Test', lastName: 'Admin', email: 'admin@example.com' }
    };

    [null, undefined].forEach((superUser) => {
      it(`should load every row when an organisation has ${superUser} administrator details`, () => {
        pbaServiceSpy.searchPbasWithPagination.and.returnValue(of({
          organisations: [
            organisation,
            { ...organisation, organisationIdentifier: 'ORG456', superUser },
            { ...organisation, organisationIdentifier: 'ORG789' }
          ],
          total_records: 2604
        }));

        component.ngOnInit();

        expect(component.pbasLoaded).toBeTrue();
        expect(component.pendingPBAsCount).toBe(2604);
        expect(component.orgsWithPendingPBAs.length).toBe(3);
        expect(component.orgsWithPendingPBAs[1]).toEqual(jasmine.objectContaining({
          organisationId: 'ORG456',
          name: organisation.organisationName,
          pbaNumbers: organisation.pbaNumbers,
          admin: '',
          adminEmail: ''
        }));
        expect(component.orgsWithPendingPBAs[2].admin).toBe('Test Admin');
        expect(component.orgsWithPendingPBAs[2].adminEmail).toBe('admin@example.com');

        component.onPaginationHandler(260);

        expect(component.pagination.page_number).toBe(260);
        expect(component.orgsWithPendingPBAs.length).toBe(3);
        expect(pbaServiceSpy.searchPbasWithPagination).toHaveBeenCalledWith(jasmine.objectContaining({
          searchRequest: jasmine.objectContaining({
            pagination_parameters: { page_number: 260, page_size: 10 }
          })
        }));
      });
    });

    it('should display the available name when administrator details are incomplete', () => {
      pbaServiceSpy.searchPbasWithPagination.and.returnValue(of({
        organisations: [{ ...organisation, superUser: { firstName: 'Test' } }],
        total_records: 1
      }));

      component.ngOnInit();

      expect(component.orgsWithPendingPBAs[0].admin).toBe('Test');
      expect(component.orgsWithPendingPBAs[0].adminEmail).toBe('');
    });
  });

  describe('getReceivedDate', () => {
    beforeEach(() => {
      pbaServiceSpy.searchPbasWithPagination.and.returnValue(of());
      fixture.detectChanges();
    });

    it('should choose the earliest dateCreated from a list of string dates', () => {
      const pbaNumber = 'PBA1231231';
      const dateLatest = new Date('February 28, 2022 01:23:45').toISOString();
      const dateEarliest = new Date('February 21, 2022 09:10:11').toISOString();
      const pbaNumbers = [{ pbaNumber, dateCreated: dateLatest }, { pbaNumber, dateCreated: dateEarliest }];
      const receivedDate = component.getReceivedDate(pbaNumbers);
      component.orgsWithPendingPBAs = [{
        organisationId: 'test',
        admin: 'test',
        adminEmail: 'test@test.com',
        name: 'test',
        pbaNumbers: [{ pbaNumber }],
        receivedDate: dateEarliest
      }];
      expect(receivedDate).toEqual(dateEarliest);
    });

    it('should return pagenumber', () => {
      component.onPaginationHandler(3);
      expect(component.pagination.page_number).toEqual(3);
    });
  });
});
