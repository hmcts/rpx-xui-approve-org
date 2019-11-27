import {Component, OnInit} from '@angular/core';
import * as fromStore from '../../store';
import { Store, select } from '@ngrx/store';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {OrgManagerConstants} from '../../org-manager.constants';
import {take} from 'rxjs/operators';

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
  public formValidationMessages = [
    'Enter a PBA number, for example PBA1234567'
  ];


  constructor(private store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {
    this.pbaInputs = OrgManagerConstants.PBA_INPUT_FEED;
    this.changePbaFG = new FormGroup({});
    this.createPbaForm();
  }

  createPbaForm() {
    for (const inputs of this.pbaInputs ) {
      this.changePbaFG.addControl(inputs.config.name, new FormControl(''));
      // if (inputs.config.name === 'pba1') {
      const validators = [
        Validators.pattern(/(PBA\w*)/i),
        Validators.maxLength(10),
        Validators.minLength(10)
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
          (this.fPba.pba1.errors && this.fPba.pba1.errors.required) || null,
          (this.fPba.pba1.errors && this.fPba.pba1.errors.pattern) || null,
          (this.fPba.pba1.errors && this.fPba.pba1.errors.maxLength) || null,
          (this.fPba.pba1.errors && this.fPba.pba1.errors.minlength) || null
        ],
        pba2: [
          (this.fPba.pba2.errors && this.fPba.pba2.errors.required) || null,
          (this.fPba.pba2.errors && this.fPba.pba2.errors.pattern) || null,
          (this.fPba.pba2.errors && this.fPba.pba2.errors.maxLength)|| null,
          (this.fPba.pba2.errors && this.fPba.pba2.errors.minlength) || null
        ]
      },
      errorMsg: this.formValidationMessages
    };

    console.log(validation);
    this.store.dispatch(new fromStore.DispatchSubmitValidation(validation));

  }

}
