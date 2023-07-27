import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { checkboxesBeCheckedValidator } from '@hmcts/rpx-xui-common-lib';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppConstants } from '../../../app/app.constants';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store';

/*
* User Form entry mediator component
* It holds the state
* */

@Component({
  selector: 'app-prd-reinvite-user-component',
  templateUrl: './reinvite-user.component.html'
})
export class ReinviteUserComponent implements OnInit, OnDestroy {
  constructor(private readonly store: Store<fromStore.OrganisationRootState>,
              private readonly actions$: Actions) {}

  public inviteUserForm: UntypedFormGroup;
  public organisationId$: Observable<string>;

  public errors$: Observable<any>;
  public errorsArray$: Observable<{ isFromValid: boolean; items: { id: string; message: any; } []}>;
  public showWarningMessage: boolean;
  private getSelectedUserSub: Subscription;

  public errorMessages = {
    firstName: ['Enter first name'],
    lastName: ['Enter last name'],
    email: ['Enter email address', 'Email must contain at least the @ character'],
    roles: ['You must select at least one action']
  };

  public ngOnInit(): void {
    this.errors$ = this.store.pipe(select(fromStore.getInviteUserErrorMessageSelector));
    this.errorsArray$ = this.store.pipe(select(fromStore.getGetInviteUserErrorsArray));

    this.inviteUserForm = new UntypedFormGroup({
      firstName: new UntypedFormControl('', Validators.required),
      lastName: new UntypedFormControl('', Validators.required),
      email: new UntypedFormControl('', [Validators.email, Validators.required]),
      roles: new UntypedFormGroup({
        'pui-case-manager': new UntypedFormControl(''),
        'pui-user-manager': new UntypedFormControl(''),
        'pui-organisation-manager': new UntypedFormControl(''),
        'pui-finance-manager': new UntypedFormControl('')
      }, checkboxesBeCheckedValidator())
    });

    this.getSelectedUserSub = this.store.pipe(select(fromStore.getSelectedUserSelector)).subscribe((pendingUser) => {
      if (pendingUser) {
        this.inviteUserForm.controls.firstName.setValue(pendingUser.firstName);
        this.inviteUserForm.controls.lastName.setValue(pendingUser.lastName);
        this.inviteUserForm.controls.email.setValue(pendingUser.email);

        this.inviteUserForm.controls.firstName.disable();
        this.inviteUserForm.controls.lastName.disable();
        this.inviteUserForm.controls.email.disable();
      }
    });

    this.organisationId$ = this.store.pipe(select(fromStore.getOrganisationIdSelector));

    this.actions$.pipe(ofType(fromStore.SUBMIT_REINVITE_USER_ERROR_CODE_429)).subscribe(() => {
      this.showWarningMessage = true;
    });
  }

  // convenience getter for easy access to form fields
  public get f() {
    return this.inviteUserForm.controls;
  }

  public onSubmit(orgId: string) {
    this.showWarningMessage = false;
    this.dispatchValidationAction();
    if (this.inviteUserForm.valid) {
      let value = this.inviteUserForm.getRawValue();
      const permissions = Object.keys(value.roles).filter((key) => {
        if (value.roles[key]) {
          return key;
        }
      });

      const ccdRoles = this.inviteUserForm.value.roles['pui-case-manager'] ? AppConstants.CCD_ROLES : [];

      const roles = [
        ...permissions,
        ...ccdRoles
      ];
      value = {
        ...value,
        resendInvite: true,
        roles
      };
      this.store.dispatch(new fromStore.SubmitReinviteUser({ organisationId: orgId, form: value }));
    }
  }

  public dispatchValidationAction() {
    // set form errors
    const formValidationData = {
      isInvalid: {
        firstName: [(this.f.firstName.errors && this.f.firstName.errors.required)],
        lastName: [(this.f.lastName.errors && this.f.lastName.errors.required)],
        email: [
          (this.f.email.errors && this.f.email.errors.required),
          (this.f.email.errors && this.f.email.errors.email)
        ],
        roles: [(this.f.roles.errors && this.f.roles.errors.requireOneCheckboxToBeChecked)]
      },
      errorMessages: this.errorMessages,
      isSubmitted: true
    };
    this.store.dispatch(new fromStore.UpdateErrorMessages(formValidationData));
  }

  public onGoBack() {
    this.store.dispatch(new fromRoot.Back());
  }

  public ngOnDestroy() {
    if (this.getSelectedUserSub) {
      this.getSelectedUserSub.unsubscribe();
    }
  }
}
