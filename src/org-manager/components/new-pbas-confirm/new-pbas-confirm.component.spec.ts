import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { PBAAccountApprovalComponent, PBAAccountDecisionComponent } from '..';
import { AppUtils } from '../../../app/utils/app-utils';
import { Organisation, OrganisationAddress } from '../../models/organisation';
import { PbaService } from '../../services';
import { OrganisationAddressComponent } from '../organisation-address';

import { NewPBAsConfirmComponent } from './new-pbas-confirm.component';

describe('NewPBAsConfirmComponent', () => {
  let component: NewPBAsConfirmComponent;
  let fixture: ComponentFixture<NewPBAsConfirmComponent>;
  const pbaServiceSpy = jasmine.createSpyObj('PbaService', ['setPBAStatus']);
  const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule, ReactiveFormsModule , RouterTestingModule.withRoutes([])],
      declarations: [NewPBAsConfirmComponent, OrganisationAddressComponent, PBAAccountApprovalComponent, PBAAccountDecisionComponent],
      providers: [
        { provide: PbaService, useValue: pbaServiceSpy },
        { provide: Router, useValue: routerMock }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPBAsConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    pbaServiceSpy.setPBAStatus.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should confirm the new PBAs', () => {
    component.newPBAs = new Map<string, string>();
    component.newPBAs.set('test1', 'test 1 value');
    component.newPBAs.set('test2', 'test 2 value');

    const orgAddress: [OrganisationAddress] = [{
      addressLine1: 'Line1',
      addressLine2: 'Some Address1',
      townCity: 'London',
      county: 'Middlesex',
      postCode: 'org.postCode',
      dxAddress: [
        {
          dxNumber: '1111111111111',
          dxExchange: 'DX Exchange 1'
        }
      ]
    }
    ];

    const organisations: Organisation = {
      organisationIdentifier: 'ABCD1234',
      name: 'Test Org',
      status: 'PENDING',
      sraId: 'SRA1234560123',
      superUser: {
        userIdentifier: '1fab0a19-e83a-436e-8ceb-e43ab487c6ed',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com'
      },
      paymentAccount: [{}],
      contactInformation: orgAddress
    };
    component.org = AppUtils.mapOrganisation(organisations);

    component.confirmPBAs();
    expect(routerMock.navigateByUrl).toHaveBeenCalled();
  });

});
