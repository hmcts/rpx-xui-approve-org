import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PBAAccountApprovalComponent } from '..';
import { OrganisationAddressComponent } from '../organisation-address';

import { OrganisationVM } from '../../models/organisation';
import { NewPBAsInfoComponent } from './new-pbas-info.component';

describe('NewPBAsInfoComponent', () => {
  let component: NewPBAsInfoComponent;
  let fixture: ComponentFixture<NewPBAsInfoComponent>;

  const mockOrgData: OrganisationVM = {
    name: 'Glen Byrne',
    organisationId: 'ByrneLimited',
    addressLine1: '13 Berryfield drive, Finglas',
    addressLine2: '',
    townCity: '',
    county: '',
    pbaNumber: ['PBA0101012'],
    admin: 'Glen Byrne',
    status: 'APPROVED',
    view: 'View',
    adminEmail: 'glen@byrne.com',
    dxNumber: [{}],
    postCode: '',
    pendingPaymentAccount: ['PBA0101012'],
    accountDetails: [{
      account_number: 'PBA0101012',
      account_name: 'RAY NIXON BROWN',
      credit_limit: 5000,
      available_balance: 5000,
      status: 'Deleted',
      effective_date: '2019-12-22T19:30:55.000Z'
    }]
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule, ReactiveFormsModule, FormsModule, RouterTestingModule.withRoutes([])],
      declarations: [NewPBAsInfoComponent, OrganisationAddressComponent, PBAAccountApprovalComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPBAsInfoComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      PBA0101012: new FormControl('PBA0101012', Validators.required)
    });
    component.org = mockOrgData;
    const map = new Map();
    component.newPBAs = map.set('pba', 'PBA0101012');
    fixture.detectChanges();
  });

  it('should create', () => {
    fixture.detectChanges();
    component.formGroup = new FormGroup({
      PBA0101012: new FormControl('PBA0101012', Validators.required)
    });
    expect(component).toBeTruthy();
  });

  it('should call the submitForm output event emitter when onSubmit is called', () => {
    spyOn(component.submitForm, 'emit').and.callThrough();
    const radioButton = fixture.debugElement.nativeElement.querySelector('#PBA0101012_approve');
    radioButton.click();
    fixture.detectChanges();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    expect(component.submitForm.emit).toHaveBeenCalled();
  });

  it('should not submitForm if there is no radiobutton selected', () => {
    spyOn(component.submitForm, 'emit').and.callThrough();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.submitForm.emit).not.toHaveBeenCalled();
  });

  it('should call the newPBA output emitter when the setNewPBA method is called', () => {
    spyOn(component.newPBA, 'emit').and.callThrough();
    const testName = 'test name';
    const testValue = 'test value';
    component.setNewPBA({ name: testName, value: testValue });
    expect(component.newPBA.emit).toHaveBeenCalledWith({ name: testName, value: testValue });
  });

});
