import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
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
    pbaServiceSpy.setPBAStatus.calls.reset();
    routerMock.navigate.calls.reset();
    routerMock.navigateByUrl.calls.reset();
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
      pendingPaymentAccount: [{}],
      contactInformation: orgAddress,
      orgAttributes: [{ key: 'AAA7', value: 'Damages' }]
    };
    component.org = AppUtils.mapOrganisation(organisations);

    component.confirmPBAs();
    expect(pbaServiceSpy.setPBAStatus).toHaveBeenCalled();
    expect(routerMock.navigateByUrl).toHaveBeenCalled();
  });

  it('should confirm the new PBAs with error code 400', () => {
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
      pendingPaymentAccount: [{}],
      contactInformation: orgAddress,
      orgAttributes: [{ key: 'AAA7', value: 'Damages' }]
    };
    component.org = AppUtils.mapOrganisation(organisations);
    pbaServiceSpy.setPBAStatus.and.returnValue(throwError({ status: 400, error:
      { errorDescription: 'The requested Organisation is not \'Active\'' } }));

    component.confirmPBAs();
    expect(pbaServiceSpy.setPBAStatus).toHaveBeenCalled();
    expect(component.isInactiveOrgError).toBeTruthy();
  });

  it('should emit backend PBA status errors without navigating to service down', () => {
    const errorMessage = 'PBA numbers must start with PBA/pba and be followed by 7 alphanumeric characters';
    component.newPBAs = new Map<string, string>();
    component.newPBAs.set('dsdsdsdsdsd213', 'rejected');
    component.org = { organisationId: 'HBOW4Q2' } as any;
    spyOn(component.pbaStatusError, 'emit');
    pbaServiceSpy.setPBAStatus.and.returnValue(throwError({
      status: 422,
      error: {
        pbaUpdateStatusResponses: [
          {
            pbaNumber: 'dsdsdsdsdsd213',
            errorMessage
          }
        ]
      }
    }));

    component.confirmPBAs();

    expect(component.pbaStatusError.emit).toHaveBeenCalledWith(null);
    expect(component.pbaStatusError.emit).toHaveBeenCalledWith({
      header: 'There is a problem.',
      items: [{
        id: 'confirm-pba-heading',
        message: errorMessage
      }],
      isFromValid: false
    });
    expect(routerMock.navigate).not.toHaveBeenCalledWith(['/service-down']);
  });

  it('should prioritise the inactive organisation error over PBA status errors', () => {
    component.newPBAs = new Map<string, string>();
    component.newPBAs.set('dsdsdsdsdsd213', 'rejected');
    component.org = { organisationId: 'HBOW4Q2' } as any;
    spyOn(component.pbaStatusError, 'emit');
    pbaServiceSpy.setPBAStatus.and.returnValue(throwError({
      status: 400,
      error: {
        errorDescription: 'The requested Organisation is not \'Active\'',
        pbaUpdateStatusResponses: [
          {
            pbaNumber: 'dsdsdsdsdsd213',
            errorMessage: 'PBA numbers must start with PBA/pba and be followed by 7 alphanumeric characters'
          }
        ]
      }
    }));

    component.confirmPBAs();

    expect(component.isInactiveOrgError).toBeTruthy();
    expect(component.pbaStatusError.emit).toHaveBeenCalledWith(null);
    expect(component.pbaStatusError.emit).not.toHaveBeenCalledWith(jasmine.objectContaining({
      header: 'There is a problem.'
    }));
  });

  it('should clear previous PBA status errors when confirm is retried', () => {
    component.newPBAs = new Map<string, string>();
    component.newPBAs.set('PBA1234567', 'accepted');
    component.org = { organisationId: 'HBOW4Q2' } as any;
    spyOn(component.pbaStatusError, 'emit');

    component.confirmPBAs();

    expect(component.pbaStatusError.emit).toHaveBeenCalledWith(null);
  });

  it('should confirm the new PBAs with error code 404', () => {
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
      pendingPaymentAccount: [{}],
      contactInformation: orgAddress,
      orgAttributes: [{ key: 'AAA7', value: 'Damages' }]
    };
    component.org = AppUtils.mapOrganisation(organisations);
    pbaServiceSpy.setPBAStatus.and.returnValue(throwError({ status: 404, error:
      { errorDescription: 'There is a problem' } }));

    component.confirmPBAs();
    expect(pbaServiceSpy.setPBAStatus).toHaveBeenCalled();
    expect(component.isInactiveOrgError).toBeFalsy();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/service-down']);
  });
});
