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
      declarations: [NewPBAsInfoComponent, OrganisationAddressComponent, PBAAccountApprovalComponent]
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

});
