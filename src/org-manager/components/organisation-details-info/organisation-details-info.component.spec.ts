import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { OrganisationVM } from '../../models/organisation';
import { OrganisationAddressComponent } from '../organisation-address';
import { OrganisationDetailsInfoComponent } from './organisation-details-info.component';

describe('OrganisationDetailsInfoComponent', () => {
  let component: OrganisationDetailsInfoComponent;
  let fixture: ComponentFixture<OrganisationDetailsInfoComponent>;

  const mockOrgData: OrganisationVM = {
    name: 'Glen Byrne',
    organisationId: 'ByrneLimited',
    addressLine1: '13 Berryfield drive, Finglas',
    addressLine2: '',
    townCity: '',
    county: '',
    pbaNumber: ['101010'],
    admin: 'Glen Byrne',
    status: 'ACTIVE',
    view: 'View',
    adminEmail: 'glen@byrne.com',
    dxNumber: [{}],
    postCode: '',
    accountDetails: [{
      account_number: 'PBA0088487',
      account_name: 'RAY NIXON BROWN',
      credit_limit: 5000,
      available_balance: 5000,
      status: 'Deleted',
      effective_date: '2019-12-22T19:30:55.000Z'
    }]
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule, RouterTestingModule.withRoutes([])],
      declarations: [OrganisationDetailsInfoComponent, OrganisationAddressComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationDetailsInfoComponent);
    component = fixture.componentInstance;
    component.org = mockOrgData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show heading and titles', () => {
    const headerContent = fixture.debugElement.nativeElement.querySelector('h1.govuk-heading-xl').textContent;
    expect(headerContent).toContain('Organisation details');
    const headingContent = fixture.debugElement.nativeElement.querySelector('h3.govuk-heading-m').textContent;
    expect(headingContent).toContain('Organisation details');
  });

  it('should show organisation details', () => {
    const nameContent = fixture.debugElement.nativeElement.querySelector('dd.govuk-check-your-answers__answer').textContent;
    expect(nameContent).toContain('Glen Byrne');
    const adressContent = fixture.debugElement.nativeElement.querySelector('app-org-address').textContent;
    expect(adressContent).toContain('13 Berryfield drive, Finglas');
    const mailContent = fixture.debugElement.nativeElement.querySelector('div.govuk-caption-m').textContent;
    expect(mailContent).toContain('glen@byrne.com');
    const pbaNumber = fixture.debugElement.nativeElement.querySelectorAll('dd.govuk-table-cell')[2].textContent;
    expect(pbaNumber).toContain('101010');
    const accountName = fixture.debugElement.nativeElement.querySelectorAll('span.govuk-caption-m')[0].textContent;
    expect(accountName).toContain('RAY NIXON BROWN');
  });

  describe('approveOrganisation', () => {

    it('should call approveEvent.emit if there is organisation data.', () => {

      spyOn(component.approveEvent, 'emit').and.callThrough();
      component.approveOrganisation(mockOrgData);
      expect(component.approveEvent.emit).toHaveBeenCalledWith(mockOrgData);
    });

    it('should NOT call approveEvent.emit if there is no organisation data.', () => {

      spyOn(component.approveEvent, 'emit').and.callThrough();
      component.approveOrganisation(null);
      expect(component.approveEvent.emit).toHaveBeenCalledTimes(0);
    });
  });

  describe('deleteOrganisation', () => {

    it('should call deleteEvent.emit if there is organisation data.', () => {

      spyOn(component.deleteEvent, 'emit').and.callThrough();
      component.deleteOrganisation(mockOrgData);
      expect(component.deleteEvent.emit).toHaveBeenCalledWith(mockOrgData);
    });

    it('should NOT call deleteEvent.emit if there is no orgnisation data.', () => {

      spyOn(component.deleteEvent, 'emit').and.callThrough();
      component.deleteOrganisation(null);
      expect(component.deleteEvent.emit).toHaveBeenCalledTimes(0);
    });
  });
});
