import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { OrganisationUpdateTableComponent } from '../../components/organisation-update-table/organisation-update-table.component';
import { OrganisationService } from '../../services/organisation.service';
import { OrganisationUpdateReviewComponent } from './organisation-update-review.component';

describe('OrganisationUpdateReviewComponent', () => {
  let fixture: ComponentFixture<OrganisationUpdateReviewComponent>;
  let router: jasmine.SpyObj<Router>;
  let organisationService: jasmine.SpyObj<OrganisationService>;

  const apiOrganisation = {
    organisationIdentifier: 'ORG-UPDATE-TEST',
    name: 'API-supplied Organisation',
    status: 'ACTIVE',
    sraId: 'SRA100001',
    contactInformation: [{
      addressLine1: '1 Current Street',
      addressLine2: '',
      townCity: 'London',
      county: '',
      postCode: 'SW1A 1AA',
      dxAddress: []
    }],
    superUser: {
      userIdentifier: 'requester-id',
      firstName: 'Alex',
      lastName: 'Requester',
      email: 'alex.requester@example.com'
    },
    paymentAccount: [],
    pendingPaymentAccount: [],
    dateRequested: new Date('2026-10-20T12:00:00.000Z')
  };

  beforeEach(async () => {
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    organisationService = jasmine.createSpyObj<OrganisationService>('OrganisationService', ['getOrganisationUpdate']);
    organisationService.getOrganisationUpdate.and.returnValue(of(apiOrganisation));

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [OrganisationUpdateReviewComponent, OrganisationUpdateTableComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ orgId: 'ORG-UPDATE-TEST' }) } }
        },
        { provide: OrganisationService, useValue: organisationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganisationUpdateReviewComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should load the route organisation through the single-organisation API service', () => {
    expect(organisationService.getOrganisationUpdate).toHaveBeenCalledOnceWith({ id: 'ORG-UPDATE-TEST' });
    expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe('Review organisation update');
    expect(fixture.nativeElement.querySelector('table').textContent).toContain('API-supplied Organisation');
  });

  it('should navigate to the accepted message when Accept is selected', () => {
    const acceptButton = fixture.nativeElement.querySelector('button:not(.govuk-button--warning)') as HTMLButtonElement;

    acceptButton.click();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/organisation-update-accepted');
  });

  it('should navigate to the rejected message when Reject is selected', () => {
    const rejectButton = fixture.nativeElement.querySelector('button.govuk-button--warning') as HTMLButtonElement;

    rejectButton.click();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/organisation-update-rejected');
  });

  it('should return to the organisation updates list', () => {
    fixture.componentInstance.onGoBack();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/organisation/updates');
  });
});
