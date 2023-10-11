import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
export class OrganisationDetailsInfoComponent implements OnInit {
  @Input() public org: OrganisationVM;
  @Input() public orgDeletable: boolean;
  @Output() public approveEvent: EventEmitter<OrganisationVM> = new EventEmitter();
  @Output() public deleteEvent: EventEmitter<OrganisationVM> = new EventEmitter();
  @Output() public reviewEvent: EventEmitter<OrganisationVM> = new EventEmitter();

  public formGroup: FormGroup;
  public submitted = false;
  public errorMessage: ErrorMessage;
  public regulatorType = RegulatorType;
  public regulatoryTypeEnum = RegulatoryType;
  // TODO: Remove below when API available
  public serviceToAccess: string;
  public companyRegistrationNumber: string;
  public organisationType: string;
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
    // TODO: Remove when API data available
    this.mockMissingDataTillNewVersionOfApiIsReady();
    // TODO: use first name and last name within model
    // done this way to avoid temporary test coverage problem
    this.org.firstName = this.org.admin.split(' ')[0];
    this.org.lastName = this.org.admin.split(' ')[1];
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

  // TODO: Delete the below method during the implementation of the below ticket
  // https://tools.hmcts.net/jira/browse/EUI-8869 which deals with the integration/mapping data
  // once the updated version of the API is available and provides the missing information
  private mockMissingDataTillNewVersionOfApiIsReady(): void {
    this.serviceToAccess = 'Civil';
    this.companyRegistrationNumber = '12345678';
    this.organisationType = 'IT and communications';
    this.regulators = [
      {
        regulatorType: 'Solicitor Regulation Authority (SRA)',
        organisationRegistrationNumber: '11223344'
      },
      {
        regulatorType: 'Other',
        regulatorName: 'Other regulatory organisation',
        organisationRegistrationNumber: '12341234'
      },
      {
        regulatorType: 'Charted Institute of Legal Executives',
        organisationRegistrationNumber: '43214321'
      }
    ];
    this.individualRegulators = [
      {
        regulatorType: 'Individual',
        organisationRegistrationNumber: '11223354'
      }
    ];
  }
}
