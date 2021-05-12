import {OrganisationVM} from './../../models/organisation';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of, throwError } from 'rxjs';

import * as fromRoot from '../../../app/store/reducers';
import { PbaService } from '../../services';
import * as fromStore from '../../store';
import { LoadActiveOrganisation } from '../../store/actions/organisations.actions';
import { OrganisationModel } from './models';
import { PendingPBAsComponent } from './pending-pbas.component';

describe('PendingPBAsComponent', () => {
  let component: PendingPBAsComponent;
  let fixture: ComponentFixture<PendingPBAsComponent>;
  let store: Store<fromStore.OrganisationRootState>;
  let router: Router;
  const pbaServiceSpy = jasmine.createSpyObj('PbaService', ['getPBAsByStatus', 'setPBAStatus']);

  const utils = {
    getDebugElement: (selector: string): DebugElement => {
      return fixture.debugElement.query(By.css(selector));
    },
    getDebugElements: (selector: string): DebugElement[] => {
      return fixture.debugElement.queryAll(By.css(selector));
    },
    getTitle: (): DebugElement => {
      return utils.getDebugElement('.govuk-heading-l');
    },
    getLoadingIndicator: (): DebugElement => {
      return utils.getDebugElement('.govuk-heading-s');
    },
    checkText: (de: DebugElement, text: string): void => {
      expect(de).not.toBeNull();
      expect(de.nativeElement.textContent.trim()).toEqual(text);
    },
    organisationModel: (organisationIdentifier: string, pbas: string[]): OrganisationModel => {
      return {
        organisationIdentifier,
        status: 'active',
        pbaNumbers: pbas.map(pbaNumber => {
          return { pbaNumber, status: 'pending', dateCreated: '05-06-2020 11:27:00.006' };
        })
      };
    },
    organisationVM: (organisationId: string, name: string, pbas: string[]): OrganisationVM => {
      return {
        organisationId,
        name,
        status: 'active',
        pbaNumber: pbas,
        admin: 'Admin',
        adminEmail: `admin@${name}.com`,
        addressLine1: 'Address 1',
        addressLine2: 'Address 2',
        townCity: 'Town city',
        county: 'County',
        view: 'View',
        dxNumber: []
      };
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromStore.reducers)
        })
      ],
      providers: [
        { provide: PbaService, useValue: pbaServiceSpy }
      ],
      declarations: [ PendingPBAsComponent ]
    }).compileComponents();

    store = TestBed.get(Store);
    fixture = TestBed.createComponent(PendingPBAsComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
  });

  describe('When there are no pending PBAs', () => {
    beforeEach(() => {
      pbaServiceSpy.getPBAsByStatus.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should show a table with a single row that says there are none pending', () => {
      const tds = utils.getDebugElements('td');
      expect(tds.length).toEqual(1);
      utils.checkText(tds[0], 'There are no pending PBAs');
    });

    it('should show an appropriate count of zero in the title', () => {
      utils.checkText(utils.getTitle(), 'New PBAs (0)');
      expect(component.pendingPBAsCount).toEqual(0);
    });

    it('should not show a "Loading..." indicator', () => {
      expect(utils.getLoadingIndicator()).toBeNull();
    });
  });

  describe('When PBAs have been loaded', () => {
    let storeDispatchSpy: jasmine.Spy;
    const ORGS_WITH_PENDING_PBAS: OrganisationModel[] = [
      utils.organisationModel('bob', [ 'PBA0000001', 'PBA0000002' ]),
      utils.organisationModel('jane', [ 'PBA0000005' ])
    ];
    const STORE_ORGS: OrganisationVM[] = [
      utils.organisationVM('bob', 'Bob', [ 'PBA0000001', 'PBA0000002' ]),
      utils.organisationVM('fred', 'Fred', [ 'PBA0000003', 'PBA0000004' ]),
      utils.organisationVM('jane', 'Jane', [ 'PBA0000005', 'PBA0000006', 'PBA0000007' ])
    ];
    beforeEach(() => {
      pbaServiceSpy.getPBAsByStatus.and.returnValue(of(ORGS_WITH_PENDING_PBAS));
      storeDispatchSpy = spyOn(store, 'dispatch').and.callThrough();
      fixture.detectChanges();
    });

    describe('Before active organisations have been loaded', () => {
      it('should attempt to load active organisations', () => {
        expect(storeDispatchSpy).toHaveBeenCalledWith(jasmine.any(LoadActiveOrganisation));
      });

      it('should show a "Loading..." indicator', () => {
        const loading = utils.getLoadingIndicator();
        utils.checkText(loading, 'Loading...');
      });

      it('should show an appropriate title without a count', () => {
        const title = utils.getTitle();
        utils.checkText(title, 'New PBAs'); // No count in brackets.
        expect(component.pendingPBAsCount).toEqual(-1);
      });
    });

    describe('After active organisations have been loaded', () => {
      beforeEach(() => {
        component.handleLoadedActiveOrganisations(STORE_ORGS, ORGS_WITH_PENDING_PBAS);
        fixture.detectChanges();
      });

      it('should not show a "Loading..." indicator', () => {
        expect(utils.getLoadingIndicator()).toBeNull();
      });

      it('should show an appropriate title with a count', () => {
        const title = utils.getTitle();
        utils.checkText(title, 'New PBAs (3)'); // bob + jane, but not fred.
        expect(component.pendingPBAsCount).toEqual(3);
      });

      it('should render one row per organisation', () => {
        expect(component.orgsWithPendingPBAs).toBeDefined();
        expect(component.orgsWithPendingPBAs.length).toEqual(2); // bob + jane, but not fred

        const trs = utils.getDebugElements('tbody > tr');
        expect(trs.length).toEqual(2);
        const tds = utils.getDebugElements('td');
        expect(tds.length).toEqual(10);
        utils.checkText(tds[0], STORE_ORGS[0].name); // 'Bob'
        utils.checkText(tds[5], STORE_ORGS[2].name); // 'Jane'
      });
    });
  });

  describe('When loading PBAs fails', () => {
    let navigateSpy: jasmine.Spy;
    const checkErrorHandling = (status: number, expectedUrl: string): void => {
      pbaServiceSpy.getPBAsByStatus.and.returnValue(throwError({ status }));
      fixture.detectChanges();
      expect(navigateSpy).toHaveBeenCalledWith(expectedUrl);
    };
    beforeEach(() => {
      navigateSpy = spyOn(router, 'navigateByUrl');
    });

    // Service down errors.
    [500, 400, 404].forEach(status => {
      it(`should redirect to service down page on ${status} error`, () => {
        checkErrorHandling(status, '/service-down');
      });
    });

    // Not authorised errors.
    [401, 403].forEach(status => {
      it(`should redirect to not authorised page on ${status} error`, () => {
        checkErrorHandling(status, '/not-authorised');
      });
    });
  });
});
