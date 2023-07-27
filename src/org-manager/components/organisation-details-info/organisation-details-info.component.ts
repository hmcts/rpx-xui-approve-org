import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { OrganisationVM } from 'src/org-manager/models/organisation';
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

  public formGroup: UntypedFormGroup;
  public submitted = false;
  public errorMessage: ErrorMessage;
  private readonly genericError = 'There is a problem';
  private readonly radioSelectedControlName = 'radioSelected';
  public readonly registrationRequest: DisplayedRequest[];

  constructor(private readonly fb: UntypedFormBuilder) {
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
      radioSelected: new UntypedFormControl(null, Validators.required)
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
