import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PBAAccountApprovalComponent } from '..';
import { OrganisationAddressComponent } from '../organisation-address';

import { NewPBAsInfoComponent } from './new-pbas-info.component';

describe('NewPBAsInfoComponent', () => {
  let component: NewPBAsInfoComponent;
  let fixture: ComponentFixture<NewPBAsInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule, RouterTestingModule.withRoutes([])],
      declarations: [NewPBAsInfoComponent, OrganisationAddressComponent, PBAAccountApprovalComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPBAsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call the submitForm output event emitter when onSubmit is called', () => {
    spyOn(component.submitForm, 'emit').and.callThrough();
    component.onSubmitForm();
    expect(component.submitForm.emit).toHaveBeenCalled();
  });

  it('should call the newPBA output emitter when the setNewPBA method is called', () => {
    spyOn(component.newPBA, 'emit').and.callThrough();
    const testName = 'test name';
    const testValue = 'test value';
    component.setNewPBA({ name: testName, value: testValue });
    expect(component.newPBA.emit).toHaveBeenCalledWith({ name: testName, value: testValue });
  });

});
