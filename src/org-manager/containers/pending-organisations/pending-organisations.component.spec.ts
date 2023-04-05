import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { OrganisationAddressComponent } from '../../components/organisation-address';
import { OrganisationService } from '../../services';
import { PendingOrganisationsComponent } from './pending-organisations.component';

describe('PendingOrganisationComponent', () => {
  let component: PendingOrganisationsComponent;
  let fixture: ComponentFixture<PendingOrganisationsComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ExuiCommonLibModule
      ],
      declarations: [
        PendingOrganisationsComponent,
        OrganisationAddressComponent
      ],
      providers: [
        OrganisationService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingOrganisationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should create component', () => {
    expect(component.view).toBe('NEW');
  });
});

