import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { UpdatePbaServices } from 'src/org-manager/services/update-pba.services';
import * as fromRoot from '../../../app/store';
import { OrganisationDetails } from '../../models/organisation';
import { PendingPaymentAccount } from '../../models/pendingPaymentAccount.model';
import { OrgManagerConstants, PBAConfig } from '../../org-manager.constants';
import { PbaService } from '../../services/pba.service';
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
  private subscirptions: Subscription;
  public orgId: string;
  public pbaNumbers: string[];
  public saveDisabled = true;
  public serverError$: Observable<{ type: string; message: string }>;
  public organisationDetails: OrganisationDetails;

  constructor(
    private readonly updatePbaServices: UpdatePbaServices,
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly pbaService: PbaService,
    private readonly router: Router,
    private readonly fb: FormBuilder) { }

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
    this.orgDetails$ = this.store.pipe(select(fromStore.getActiveAndPending),
      tap((value) => {
        if (value) {
          this.orgId = value.organisationId;
          this.pbaNumbers = value.pbaNumber;
          this.createPbaForm();
          this.saveDisabled = !value.pbaNumber;
        } else if (!value && !this.orgId) {
          this.store.dispatch(new fromStore.LoadActiveOrganisation());
          this.store.dispatch(new fromStore.LoadPendingOrganisations());
        }
      }));
  }

  public get pbaFormArrayNumbers(): FormArray {
    return this.changePbaFG.get('pbaNumbers') as FormArray;
  }

  public get currentPaymentAccounts(): PBANumberModel[] {
    return this.organisationDetails.paymentAccount
      .filter(pba => !this.organisationDetails.pendingRemovePaymentAccount.includes(pba));
  }

  private getPbaNumberValidators(): ValidatorFn[] {
    return [
      Validators.pattern(/(PBA\w*)/i),
      Validators.minLength(10),
      Validators.maxLength(10),
      RxwebValidators.noneOf({
        matchValues: this.currentPaymentAccounts.map(pba => pba.pbaNumber)
      }),
      RxwebValidators.unique()
    ];
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
      for (const inputs of this.pbaInputs) {
        this.addPbaFormItem(inputs.name);
      }

      this.store.pipe(select(fromStore.getPbaNumber), take(1)).subscribe((pba: string) => {
        pba.split(',').map((p, i) => {
          this.changePbaFG.patchValue({ [`pba${i + 1}`]: p });
        });
      });

      this.subscirptions = this.changePbaFG.valueChanges.subscribe(value => {
        const pba: string[] = Object.keys(value).map(key => value[key]).filter(item => item !== '');
        const isNewPba = JSON.stringify(this.pbaNumbers) === JSON.stringify(pba);
        this.saveDisabled = !isNewPba;
      });
    }
  }


  public onSubmitPba(): void {
    this.dispatchStoreValidation();
    const { valid, value } = this.changePbaFG;
    const paymentAccounts: string[] = Object.keys(value).map(key => value[key]).filter(item => item !== '');

    const paymentAccountUpdated: string[] = [];
    // const paymentAccountAdded: string[] = [];
    paymentAccounts.forEach(paymentAccount => {
      if (typeof paymentAccount === 'string') {
        paymentAccountUpdated.push(paymentAccount.toString());
      }
    });

    // for (let p = 0; p < paymentAccounts.length; p++) {
    //   if (typeof paymentAccounts[p] === 'string') {
    //     paymentAccountUpdated.push(paymentAccounts[p].toString());
    //     if (p - 1 < this.pbaNumbers.length) {
    //       paymentAccountUpdated.push(paymentAccounts[p].toString());
    //     } else {
    //       paymentAccountAdded.push(paymentAccounts[p].toString());
    //     }
    //   }
    // }

    if (valid) {
      this.updatePbaServices.updatePba({ paymentAccounts: paymentAccountUpdated, orgId: this.orgId }).subscribe(() => {
        console.log('done');
        this.router.navigateByUrl('/organisation');
      });
      // this.store.dispatch(new fromStore.SubmitPba({ paymentAccounts: paymentAccountUpdated, orgId: this.orgId }));
      // this.pbaService.updatePBAs(this.pendingChanges(paymentAccountAdded)).subscribe(() => console.log('done'));
    }
  }

  private dispatchStoreValidation(): void {
    const validation = {
      isInvalid: {
        pba1: [
          (this.fPba.pba1.errors && this.fPba.pba1.errors.pattern),
          (this.fPba.pba1.errors && this.fPba.pba1.errors.minlength),
          (this.fPba.pba1.errors && this.fPba.pba1.errors.maxLength)
        ],
        pba2: [
          (this.fPba.pba2.errors && this.fPba.pba2.errors.pattern),
          (this.fPba.pba2.errors && this.fPba.pba2.errors.minlength),
          (this.fPba.pba2.errors && this.fPba.pba2.errors.maxLength)
        ]
      },
      errorMsg: OrgManagerConstants.PBA_ERROR_MESSAGES
    };
    this.store.dispatch(new fromStore.DispatchSaveValidation(validation));
  }

  public ngOnDestroy(): void {
    if (this.subscirptions) {
      this.subscirptions.unsubscribe();
    }
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

