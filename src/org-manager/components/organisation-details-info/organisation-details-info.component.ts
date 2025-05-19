import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LovRefDataModel } from '../../../shared/models/lovRefData.model';
import { OrganisationVM, Regulator } from '../../models/organisation';
import { RegulatorType, RegulatoryType } from '../../models/regulator-type.enum';
import { DisplayedRequest, ErrorMessage, RequestErrors, RequestType } from './models/organisation-details';

/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-org-details-info',
  templateUrl: './organisation-details-info.component.html'
})
export class OrganisationDetailsInfoComponent implements OnChanges, OnInit {
  @Input() public org: OrganisationVM;
  @Input() public orgDeletable: boolean;
  @Input() public orgTypes: LovRefDataModel[];
  @Output() public approveEvent: EventEmitter<OrganisationVM> = new EventEmitter();
  @Output() public deleteEvent: EventEmitter<OrganisationVM> = new EventEmitter();
  @Output() public reviewEvent: EventEmitter<OrganisationVM> = new EventEmitter();

  public formGroup: FormGroup;
  public submitted = false;
  public errorMessage: ErrorMessage;
  public regulatorType = RegulatorType;
  public regulatoryTypeEnum = RegulatoryType;
  public companyNumber: string;
  public orgType: string;
  public orgTypeDescription: string;
  public serviceList: string[];
  public regulators: Regulator[];
  public individualRegulators: Regulator[];

  private readonly genericError = 'There is a problem';
  private readonly radioSelectedControlName = 'radioSelected';
  public readonly registrationRequest: DisplayedRequest[];

  constructor(private readonly fb: FormBuilder) {
    this.registrationRequest = [
      { request: RequestType.APPROVE_REQUEST, checked: false },
      { request: RequestType.REJECT_REQUEST, checked: false },
      { request: RequestType.REVIEW_REQUEST, checked: false }
    ];
  }

  public pbaNumbers(): string[] {
    return this.org?.pbaNumber?.length
      ? this.org.pbaNumber
      : this.org?.pendingPaymentAccount?.length
        ? this.org.pendingPaymentAccount : [];
  }

  public ngOnInit(): void {
    this.formGroup = this.fb.group({
      radioSelected: new FormControl(null, Validators.required)
    });
    this.setOrganisationDisplay();
  }

  public ngOnChanges(): void {
    this.setOrganisationDisplay();
  }

  private setOrganisationDisplay(): void {
    // Note: ternary operator included only in case where firstname or lastname not known
    this.org.firstName = this.org.firstName ? this.org.firstName : this.org.admin.split(' ')[0];
    this.org.lastName = this.org.lastName ? this.org.lastName : this.org.admin.split(' ')[1];
    this.companyNumber = this.org.companyNumber;
    this.orgType = this.org.orgType;
    if (this.orgTypes?.length > 0) {
      this.setOrgTypeDescription();
    }
    if (!this.org.orgAttributes || this.org.orgAttributes.length === 0) {
      return;
    }
    this.regulators = [];
    this.individualRegulators = [];
    const regulatorList = this.org.orgAttributes.filter((orgAttribute) => orgAttribute.key.includes('regulators'));
    const individualRegulatorList = this.org.orgAttributes.filter((orgAttribute) => orgAttribute.key.includes('individualRegulators'));
    regulatorList.map((regulator) => {
      this.regulators.push(JSON.parse(regulator.value));
    });
    individualRegulatorList.map((regulator) => {
      this.individualRegulators.push(JSON.parse(regulator.value));
    });
    this.serviceList = [];
    this.org.orgAttributes.forEach((services) => {
      if (!services.key.includes('regulators') && !services.key.includes('individualRegulators')) {
        this.serviceList.push(services.value);
      }
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    if (this.formGroup.get(this.radioSelectedControlName).invalid) {
      this.errorMessage = {
        title: this.genericError,
        description: RequestErrors.NO_SELECTION,
        fieldId: 'options'
      };
    }
    if (this.formGroup.invalid) {
      return;
    }
    const radioSelectedValue = this.formGroup.get(
      this.radioSelectedControlName
    ).value;

    switch (radioSelectedValue) {
      case RequestType.APPROVE_REQUEST:
        this.approveOrganisation(this.org);
        break;
      case RequestType.REJECT_REQUEST:
        this.deleteOrganisation(this.org);
        break;
      default:
        this.reviewOrganisation(this.org);
        break;
    }
  }

  private setOrgTypeDescription(): void {
    const nonOtherOrgType = this.orgTypes.find((orgType) => orgType.key === this.orgType);
    this.orgTypeDescription = nonOtherOrgType ? nonOtherOrgType.value_en : `Other: ${this.getOrgTypeOther()}`;
  }

  private getOrgTypeOther(): string {
    const otherOrgTypes = this.orgTypes.find((orgType) => orgType.key === 'OTHER');
    return otherOrgTypes.child_nodes.find((orgType) => orgType.key === this.orgType).value_en;
  }

  public onChange(): void {
    this.submitted = false;
  }

  /**
   * Approve Organisation
   *
   * Send an event to the parent to approve the organisation.
   */
  public approveOrganisation(data: OrganisationVM) {
    if (data) {
      this.approveEvent.emit(data);
    }
  }

  /**
   * Delete Organisation
   *
   * Send an event to the parent to delete the organisation.
   */
  public deleteOrganisation(data: OrganisationVM) {
    if (data) {
      this.deleteEvent.emit(data);
    }
  }

  /**
   * Review Organisation
   *
   * Send an event to the parent to delete the organisation.
   */
  public reviewOrganisation(data: OrganisationVM) {
    if (data) {
      this.reviewEvent.emit(data);
    }
  }
}
