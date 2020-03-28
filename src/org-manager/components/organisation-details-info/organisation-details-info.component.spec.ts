import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OrganisationVM } from 'src/org-manager/models/organisation';
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
      imports: [ RouterModule, RouterTestingModule.withRoutes([]) ],
      declarations: [ OrganisationDetailsInfoComponent ]
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

  it('should call the approveOrganisation only when there is data', () => {
    spyOn(component.approveEvent, 'emit').and.callThrough();
    component.approveOrganisation(mockOrgData);
    expect(component.approveEvent.emit).toHaveBeenCalledWith(mockOrgData);
  });

  it('should call the approveOrganisation only when there is data', () => {
    spyOn(component.approveEvent, 'emit').and.callThrough();
    component.approveOrganisation(null);
    expect(component.approveEvent.emit).toHaveBeenCalledTimes(0);
  });

});
