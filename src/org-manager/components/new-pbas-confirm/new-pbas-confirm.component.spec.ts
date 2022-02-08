import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PBAAccountApprovalComponent } from '..';
import { OrganisationAddressComponent } from '../organisation-address';

import { NewPBAsConfirmComponent } from './new-pbas-confirm.component';

describe('NewPBAsConfirmComponent', () => {
  let component: NewPBAsConfirmComponent;
  let fixture: ComponentFixture<NewPBAsConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule, RouterTestingModule.withRoutes([])],
      declarations: [NewPBAsConfirmComponent, OrganisationAddressComponent, PBAAccountApprovalComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPBAsConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
