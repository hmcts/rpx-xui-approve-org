import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { select, Store } from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {take, tap} from 'rxjs/operators';
import * as fromRoot from '../../../app/store';
import {OrgManagerConstants} from '../../org-manager.constants';
import * as fromStore from '../../store';

/**
 * Bootstraps Edit Organisation Details
 */
@Component({
  selector: 'app-change-details',
  templateUrl: './edit-details.component.html'
})
export class EditDetailsComponent implements OnInit, OnDestroy {
  public changePbaFG: FormGroup;
  public pbaInputs: {config: {name: string}}[];
  public pbaError$: Observable<object>;
  public pbaErrorsHeader$: Observable<any>;
  public orgDetails$: Observable<any>;
  private subscirptions: Subscription;
  public orgId: string;
  public pbaNumbers: string[];
  public saveDisabled = true;
  public serverError$: Observable<{ type: string; message: string }>;

  constructor(private store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {
    this.pbaInputs = OrgManagerConstants.PBA_INPUT_FEED;
    this.changePbaFG = new FormGroup({});
    this.getOrgs();
    this.createPbaForm();
    this.getErrorMsgs();
  }

  private getOrgs(): void {
    this.orgDetails$ = this.store.pipe(select(fromStore.getActiveAndPending),
        tap((value) => {
          if (value) {
            this.orgId = value.organisationId;
            this.pbaNumbers = value.pbaNumber;
            this.saveDisabled = !value.pbaNumber;
          } else if (!value && !this.orgId) {
            this.store.dispatch(new fromStore.LoadActiveOrganisation());
            this.store.dispatch(new fromStore.LoadPendingOrganisations());
          }
        }));
  }
  private getErrorMsgs() {
    this.store.dispatch(new fromStore.ClearPbaErrors());
    this.pbaError$ = this.store.pipe(select(fromStore.getPbaFromErrors));
    this.pbaErrorsHeader$ = this.store.pipe(select(fromStore.getPbaHeaderErrors));
    this.serverError$ = this.store.pipe(select(fromStore.getServerErrors));
  }

  createPbaForm(): void {
    for (const inputs of this.pbaInputs ) {
      this.changePbaFG.addControl(inputs.config.name, new FormControl(''));
      const validators = [
        Validators.pattern(/(PBA\w*)/i),
        Validators.minLength(10),
        Validators.maxLength(10)
      ];
      this.changePbaFG.controls[inputs.config.name].setValidators(validators);
      this.changePbaFG.controls[inputs.config.name].updateValueAndValidity();
    }

    this.store.pipe(select(fromStore.getPbaNumber), take(1)).subscribe((pba: string) => {
      pba.split(',').map((p, i) => {
        this.changePbaFG.patchValue({[`pba${i + 1}`]: p});
      });
    });

    this.subscirptions = this.changePbaFG.valueChanges.subscribe(value => {
      const pba: string[] = Object.keys(value).map(key => value[key]).filter(item => item !== '');
      const isNewPba = JSON.stringify(this.pbaNumbers) === JSON.stringify(pba);
      this.saveDisabled = !isNewPba;
    });

  }

  // convenience getter for easy access to form fields
  get fPba() { return this.changePbaFG.controls; }

  public onSubmitPba(): void {
    this.dispatchStoreValidation();
    const {valid, value} = this.changePbaFG;
    const paymentAccounts: string[] = Object.keys(value).map(key => value[key]).filter(item => item !== '');
    if (valid) {
      this.store.dispatch(new fromStore.SubmitPba({paymentAccounts, orgId: this.orgId}));
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

  ngOnDestroy(): void {
    this.subscirptions.unsubscribe();
  }

  public onGoBack() {
    this.store.dispatch(new fromRoot.Back());
  }

}
