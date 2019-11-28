import {Component, OnInit} from '@angular/core';
import * as fromStore from '../../store';
import { Store, select } from '@ngrx/store';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {OrgManagerConstants} from '../../org-manager.constants';
import {take, tap} from 'rxjs/operators';
import * as fromEditDetails from '../../store'
import {Observable} from 'rxjs';

/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-change-details',
  templateUrl: './edit-details.component.html'
})
export class EditDetailsComponent implements OnInit {

  public dxNumber: string;
  public dxExchange: string;
  public changePbaFG: FormGroup;
  public pbaInputs: {config: {name: string}}[];
  public pbaError$: Observable<object>;
  public pbaErrorsHeader$: Observable<any>;
  public orgDetails$: Observable<any>;
  public formValidationMessages = [
    'Enter a PBA number, for example PBA1234567'
  ];


  constructor(private store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {
    this.orgDetails$ = this.store.pipe(select(fromEditDetails.getActiveAndPending));
    this.pbaInputs = OrgManagerConstants.PBA_INPUT_FEED;
    this.changePbaFG = new FormGroup({});
    this.createPbaForm();
    this.getErrorMsgs();
  }

  getErrorMsgs() {
   this.pbaError$ = this.store.pipe(select(fromEditDetails.getPbaFromErrors));
   this.pbaErrorsHeader$ = this.store.pipe(select(fromEditDetails.getPbaHeaderErrors));
  }
  createPbaForm() {
    for (const inputs of this.pbaInputs ) {
      this.changePbaFG.addControl(inputs.config.name, new FormControl(''));
      // if (inputs.config.name === 'pba1') {
      const validators = [
        Validators.pattern(/(PBA\w*)/i),
        Validators.minLength(10),
        Validators.maxLength(10)
      ];
      this.changePbaFG.controls[inputs.config.name].setValidators(validators);
      this.changePbaFG.controls[inputs.config.name].updateValueAndValidity();
      // };
    }

    this.store.pipe(select(fromStore.getPbaNumber), take(1)).subscribe((pba: string) => {
      pba.split(',').map((p, i) => {
        this.changePbaFG.patchValue({[`pba${i + 1}`]: p});
      });
    });

  }
  // convenience getter for easy access to form fields
  get fPba() { return this.changePbaFG.controls; }

  public onSubmitPba(): void {
    this.dispatchValidation();
  }

  private dispatchValidation(): void {
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
      errorMsg: this.formValidationMessages
    };
    this.store.dispatch(new fromStore.DispatchSubmitValidation(validation));
  }

}
