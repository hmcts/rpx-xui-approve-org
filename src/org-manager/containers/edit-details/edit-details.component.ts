import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import _ from 'lodash';
import { Observable, of, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { PBAValidationContainerModel, PBAValidationModel } from 'src/org-manager/models/pbaValidation.model';
import { UpdatePbaServices } from 'src/org-manager/services/update-pba.services';
import * as fromRoot from '../../../app/store';
import { AppUtils } from '../../../app/utils/app-utils';
import { OrganisationDetails } from '../../models/organisation';
import { PendingPaymentAccount } from '../../models/pendingPaymentAccount.model';
import { OrgManagerConstants, PBAConfig } from '../../org-manager.constants';
import { OrganisationService } from '../../services/organisation.service';
import * as fromStore from '../../store';
import { PBANumberModel } from '../pending-pbas/models';
@Component({
  selector: 'app-change-details',
  templateUrl: './edit-details.component.html'
})
export class EditDetailsComponent implements OnInit, OnDestroy {
  public changePbaFG: FormGroup;
  public pbaInputs: PBAConfig[];
  public pbaError$: Observable<object>;
  public pbaErrorsHeader$: Observable<any>;
  public orgDetails$: Observable<any>;
  public orgId: string;
  public pbaNumbers: string[];
  public saveDisabled = true;
  public serverError$: Observable<{ type: string; message: string }>;
  public organisationDetails: OrganisationDetails;
  public subscriptions: Subscription;
  public updateSubscription: Subscription;

  public loaded = false;

  constructor(
    private readonly updatePbaServices: UpdatePbaServices,
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly organisationService: OrganisationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder) {
    this.route.params.subscribe(params => {
      this.orgId = params.orgId ? params.orgId : '';
    });
  }

  public get fPba() { return this.changePbaFG.controls; }

  public ngOnInit(): void {
    this.pbaInputs = [];
    this.changePbaFG = new FormGroup({
      pbaNumbers: this.fb.array([])
    });
    this.getOrgs();
    this.getErrorMsgs();
  }

  private getOrgs(): void {
    this.organisationService.getSingleOrganisation({ id: this.orgId })
      .pipe(map(apiOrg => AppUtils.mapOrganisation(apiOrg)))
      .subscribe(value => {
        this.orgDetails$ = of(value);
        if (value) {
          this.orgId = value.organisationId;
          this.pbaNumbers = [];
          value.pbaNumber.forEach(number => this.pbaNumbers.push(number as string));
          this.createPbaForm();
          this.saveDisabled = !value.pbaNumber;
          this.orgDetails$ = of(value);
        }
        this.loaded = true;
      });
  }

  public get pbaFormArrayNumbers(): FormArray {
    return this.changePbaFG.get('pbaNumbers') as FormArray;
  }

  public get currentPaymentAccounts(): PBANumberModel[] {
    return this.organisationDetails.paymentAccount
      .filter(pba => !this.organisationDetails.pendingRemovePaymentAccount.includes(pba));
  }

  private getErrorMsgs() {
    this.store.dispatch(new fromStore.ClearPbaErrors());
    this.pbaError$ = this.store.pipe(select(fromStore.getPbaFromErrors));
    this.pbaErrorsHeader$ = this.store.pipe(select(fromStore.getPbaHeaderErrors));
    this.serverError$ = this.store.pipe(select(fromStore.getServerErrors));
  }

  public onAddNewBtnClicked(): void {
    if (this.pbaInputs.length) {
      this.appendAnotherNumber(this.pbaInputs.length + 1);
      this.addPbaFormItem(this.pbaInputs[this.pbaInputs.length - 1].name);
    }
  }

  public remove(data: PBAConfig) {
    this.changePbaFG.removeControl(data.name);
    this.pbaInputs = this.pbaInputs.filter(input => input.id !== data.id);
  }

  public appendAnotherNumber(index: number) {
    const config = new PBAConfig();
    config.label = `PBA number ${index} (optional)`;
    config.name = `pba${index}`;
    config.id = `pba${index}`;
    config.type = 'text';
    this.pbaInputs.push(config);
  }

  public addPbaFormItem(inputsName: string) {
    this.changePbaFG.addControl(inputsName, new FormControl(''));
    const validators = [
      Validators.pattern(/(PBA\w*)/i),
      Validators.minLength(10),
      Validators.maxLength(10)
    ];
    this.changePbaFG.controls[inputsName].setValidators(validators);
    this.changePbaFG.controls[inputsName].updateValueAndValidity();
  }

  public createPbaForm(): void {
    if (this.pbaNumbers && !this.pbaInputs.length) {
      for (let i = 0; i < this.pbaNumbers.length; i++) {
        this.appendAnotherNumber(i + 1);
      }

      if (!this.pbaNumbers.length) {
        this.appendAnotherNumber(1);
      }
      for (const inputs of this.pbaInputs) {
        this.addPbaFormItem(inputs.name);
        this.pbaNumbers = [''];
      }

      this.store.pipe(select(fromStore.getPbaNumber), take(1)).subscribe((pba: string) => {
        pba.split(',').map((p, i) => {
          this.changePbaFG.patchValue({ [`pba${i + 1}`]: p });
        });
      });

      this.subscriptions = this.changePbaFG.valueChanges.subscribe(value => {
        const pba: string[] = Object.keys(value).map(key => value[key]).filter(item => item !== '');
        const isNewPba = JSON.stringify(this.pbaNumbers) === JSON.stringify(pba);
        this.saveDisabled = !isNewPba;
      });
    }
  }

  public onSubmitPba(): void {
    this.getErrorMsgs();
    this.dispatchStoreValidation();
    const { valid, value } = this.changePbaFG;
    const paymentAccounts: string[] = Object.keys(value).map(key => value[key]).filter(item => item !== '');
    const paymentAccountUpdated: string[] = [];
    paymentAccounts.forEach(paymentAccount => {
      if (typeof paymentAccount === 'string') {
        paymentAccountUpdated.push(paymentAccount.toString());
      }
    });

    if (valid) {
      this.updateSubscription = this.updatePbaServices.updatePba({ paymentAccounts: paymentAccountUpdated, orgId: this.orgId }).subscribe(() => {
        this.router.navigateByUrl(`/organisation-details/${this.orgId}`);
      }, (error) => {
        const data = error.error;
        const pbaId = this.pbaDepiction(data.errorDescription);
        const index = _.indexOf(paymentAccountUpdated, pbaId, 0);
        if (data && data.errorDescription) {
          const errorHeaderMessage = OrgManagerConstants.PBA_ERROR_ALREADY_USED_HEADER_MESSAGES[0].replace(OrgManagerConstants.PBA_MESSAGE_PLACEHOLDER, pbaId);
          const errorMessage = OrgManagerConstants.PBA_ERROR_ALREADY_USED_MESSAGES[0].replace(OrgManagerConstants.PBA_MESSAGE_PLACEHOLDER, pbaId);
          this.pbaErrorsHeader$ = of({ items: [{ id: `pba${index + 1}`, message: [errorHeaderMessage] }], isFormValid: false });
          this.pbaError$ = of({ [`pba${index + 1}`]: { messages: [errorMessage], isInvalid: true } });
        }
      });
    }
  }

  public pbaDepiction(errorDescription: string) {
    let result: string  = '';
    const errorParts = errorDescription.split(':');
    if (errorParts.length === 0) {
      result = errorParts[0];
    }

    if (errorParts.length > 1) {
      result = errorParts[1];
    }
    const start = result.indexOf('PBA');
    const end = result.indexOf(' ', start);
    return result.substring(start, end);
  }

  public ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  private dispatchStoreValidation(): void {
    const validation1 = {
      validation: {
        isInvalid: undefined,
        errorMsg: [],
      } as PBAValidationModel,
    } as PBAValidationContainerModel;
    const values = this.changePbaFG.controls;
    validation1.validation.isInvalid = Object.keys(values).reduce((acc, key) => {
      const control = this.changePbaFG.controls[key] as FormControl;
      const validations = [
        (control.errors && control.errors.pattern),
        (control.errors && control.errors.minlength),
        (control.errors && control.errors.maxLength)
      ];
      return { ...acc, [key]: validations };

    }, {});
    validation1.validation.errorMsg = OrgManagerConstants.PBA_ERROR_MESSAGES;
    this.store.dispatch(new fromStore.DispatchSaveValidation(validation1.validation));
  }

  public onGoBack() {
    this.store.dispatch(new fromRoot.Back());
  }

  public pendingChanges(appending: string[]): PendingPaymentAccount {
    return {
      pendingAddPaymentAccount: appending,
      pendingRemovePaymentAccount: []
    };
  }
}
