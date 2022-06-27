import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import _ from 'lodash';
import { Observable, of, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import * as fromRoot from '../../../app/store';
import { AppUtils } from '../../../app/utils/app-utils';
import { ErrorHeader } from '../../models/errorHeader.model';
import { OrganisationDetails } from '../../models/organisation';
import { PendingPaymentAccount } from '../../models/pendingPaymentAccount.model';
import { OrgManagerConstants, PBAConfig } from '../../org-manager.constants';
import { OrganisationService } from '../../services/organisation.service';
import { UpdatePbaServices } from '../../services/update-pba.services';
import * as fromStore from '../../store';
import { PBANumberModel } from '../pending-pbas/models';
@Component({
  selector: 'app-change-details',
  templateUrl: './edit-details.component.html'
})
export class EditDetailsComponent implements OnInit, OnDestroy {
  public changePbaFG: FormGroup;
  public pbaInputs: PBAConfig[] = [];
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
  public errorHeader: ErrorHeader;
  public errorInline = {};

  public loaded = false;

  constructor(
    private readonly updatePbaServices: UpdatePbaServices,
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly organisationService: OrganisationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder) {
    this.errorHeader = new ErrorHeader();
    this.errorHeader.items = [];
    this.route.params.subscribe(params => {
      this.orgId = params.orgId ? params.orgId : '';
    });
    this.changePbaFG = new FormGroup({
      pbaNumbers: this.fb.array([])
    });
  }

  public underscore(): any { return _;  }
  public get fPba() { return this.changePbaFG.controls; }

  public ngOnInit(): void {
    this.getOrgs();
    this.getErrorMsgs();

    this.changePbaFG.valueChanges.subscribe((x) => {
      this.duplicateValidator();
      this.charactorLengthValidator();
    });
  }

  private resetErrors() {
    this.errorHeader = new ErrorHeader();
    this.errorHeader.items = [];
    this.errorInline = {};
    this.pbaError$ = of(this.errorInline);
    this.pbaErrorsHeader$ = of(this.errorHeader);
  }

  private getOrgs(): void {
    this.organisationService.getSingleOrganisation({ id: this.orgId })
      .pipe(map(apiOrg => AppUtils.mapOrganisation(apiOrg)))
      .subscribe(value => {
        this.orgDetails$ = of(value);
        if (value) {
          this.orgId = value.organisationId;
          this.pbaNumbers = [];
          value.status === 'ACTIVE' ?
          value.pbaNumber.forEach(number => this.pbaNumbers.push(number as string)) :
          value.pendingPaymentAccount.forEach(number => this.pbaNumbers.push(number as string));
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
    if (this.pbaInputs && this.pbaInputs.length) {
      this.appendAnotherNumber(this.pbaInputs.length + 1);
      this.addPbaFormItem(this.pbaInputs[this.pbaInputs.length - 1].name);
    }
  }

  public remove(data: PBAConfig) {
    this.changePbaFG.removeControl(data.name);
    this.pbaInputs = this.pbaInputs.filter(input => input.id !== data.id);

    this.errorHeader.items = this.errorHeader.items.filter((item) => item.id !== data.name);

    if (this.errorInline[data.name]) {
      delete this.errorInline[data.name];
    }

    this.pbaErrorsHeader$ = of({ header: 'There is a problem.', items: this.errorHeader.items, isFormValid: false });
    this.pbaError$ = of(this.errorInline);
  }

  public appendAnotherNumber(index: number) {
    const config = new PBAConfig();
    config.label = `PBA number ${index} (optional)`;
    config.name = `pba${index}`;
    config.id = `pba${index}`;
    config.type = 'text';
    this.pbaInputs.push(config);
  }

  public get getPBANumbers(): string[] {
    const { value } = this.changePbaFG;
    const result = Object.keys(value).map(key => value[key]).filter(item => item !== '');
    return result;
  }

  public addPbaFormItem(inputsName: string) {
    this.changePbaFG.addControl(inputsName, new FormControl(''));
  }

  public createPbaForm(): void {
    if (this.pbaNumbers && !this.pbaInputs.length) {
      this.store.pipe(select(fromStore.getPbaNumber), take(1)).subscribe((pba: string) => {
        pba.split(',').map((p, i) => {
          this.appendAnotherNumber(i + 1);
          this.addPbaFormItem(`pba${i + 1}`);

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

  public navigateToErrorElement(elementId: string): void {
    if (elementId) {
      const htmlElement = document.getElementById(elementId);
      if (htmlElement) {
        htmlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        htmlElement.focus();
      }
    }
  }

  public onSubmitPba(): void {
    this.resetErrors();
    let isValid = true;
    const duplicationValidation = this.duplicateValidator();
    const characterValidation = this.charactorLengthValidator();
    const { value } = this.changePbaFG;
    const paymentAccounts: string[] = Object.keys(value).map(key => value[key]).filter(item => item !== '');
    const paymentAccountUpdated: string[] = [];

    isValid = duplicationValidation && characterValidation;
    paymentAccounts.forEach(paymentAccount => {
      if (typeof paymentAccount === 'string') {
        paymentAccountUpdated.push(paymentAccount.toString());
      }
    });

    if (isValid) {
      this.updateSubscription = this.updatePbaServices.updatePba({ paymentAccounts: paymentAccountUpdated, orgId: this.orgId }).subscribe(() => {
        this.router.navigateByUrl(`/organisation-details/${this.orgId}`);
      }, (error) => {
        const data = error.error;
        const formControlsKeys = Object.keys(this.fPba).filter(control => control !== 'pbaNumbers');
        const formControlsWithError = [];

        paymentAccountUpdated.forEach(paymentAccount => {
          if (data.errorDescription && data.errorDescription.indexOf(paymentAccount) > -1) {
            const errorKey = formControlsKeys.find((key) => this.fPba[key].value === paymentAccount)

            formControlsWithError.push(errorKey);
          }
        });

        formControlsWithError.forEach((controlName) => {
          if (data.errorDescription) {
            const pbaId = this.pbaDepiction(data.errorDescription);
            const index = this.underscore().indexOf(paymentAccountUpdated, pbaId, 0);
  
            if (index > -1) {
              if (data && data.errorDescription) {
                const errorHeaderMessage = OrgManagerConstants.PBA_ERROR_ALREADY_USED_HEADER_MESSAGES[0].replace(OrgManagerConstants.PBA_MESSAGE_PLACEHOLDER, pbaId);
                const errorMessage = OrgManagerConstants.PBA_ERROR_ALREADY_USED_MESSAGES[0].replace(OrgManagerConstants.PBA_MESSAGE_PLACEHOLDER, pbaId);
                this.errorInline = { 
                  [controlName]: { messages: [errorMessage], isInvalid: true }, 
                  ...this.errorInline 
                };
                this.pbaErrorsHeader$ = of({ header: 'There is a problem.', items: [{ id: controlName, message: [errorHeaderMessage] }], isFormValid: false });
                this.pbaError$ = of(this.errorInline);
              }
            } else {
              const isInvalidPba = data.errorMessage.indexOf('3 :');
              const errorHeaderMessage = isInvalidPba > -1 ? OrgManagerConstants.PBA_ERROR_VALID_PBA_MESSAGE :  OrgManagerConstants.PBA_SERVER_ERROR_MESSAGE;
              this.errorHeader.items.push({
                id: controlName, message: [errorHeaderMessage]
              });
              this.errorInline = { 
                [controlName]: { messages: [errorHeaderMessage], isInvalid: true }, 
                ...this.errorInline 
              };
              this.pbaErrorsHeader$ = of({ header: 'There is a problem.', items: [{ id: controlName, message: [errorHeaderMessage]}], isFormValid: false });
              this.pbaError$ = of(this.errorInline);
            }
          } else {
            const errorHeaderMessage = OrgManagerConstants.PBA_SERVER_ERROR_MESSAGE;
  
            this.errorHeader.isFromValid = false;
            this.errorHeader.items.push({
              id: controlName, message: [errorHeaderMessage]});
            this.errorInline = { 
              [controlName]: { messages: [errorHeaderMessage], isInvalid: true }, 
              ...this.errorInline 
            };
            this.pbaErrorsHeader$ = of({ header: 'There is a problem.', items: [{ id: controlName, message: [errorHeaderMessage]}], isFormValid: false });
            this.pbaError$ = of(this.errorInline);
          }
        });
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

  public duplicateValidator(): boolean {
    let validation = true;
    const { value } = this.changePbaFG;
    const paymentAccounts: string[] = Object.keys(value).map(key => value[key]).filter(item => item !== '');
    let paymentAccountsClone = [...paymentAccounts];
    paymentAccountsClone = this.underscore().uniq(paymentAccountsClone);
    const duplicates = [];
    const paymentAccountComparables = [...paymentAccounts];

    paymentAccountsClone.forEach((paymentAccount) => {
      const duplicateResult = paymentAccountComparables.filter(paymentAccountComparable => paymentAccountComparable === paymentAccount);
      if (duplicateResult.length > 1) {
          duplicates.push(paymentAccount);
        }
    });

    if (!duplicates.length) {
      const payAccounts = Object.keys(value).map(key => value[key]).filter(item => item !== '');
      for (let index = 0; index < payAccounts.length; index++) {
        const formControlsKeys = Object.keys(this.fPba).filter(control => control !== 'pbaNumbers');
        const errorKey = formControlsKeys.find((key) => this.fPba[key].value === payAccounts[index]);

        if (this.errorInline[errorKey]) {
          if (this.errorInline[errorKey].messages.filter(message => message.indexOf('has been entered more than once') > -1).length) {
            this.errorInline[errorKey].messages = this.errorInline[`pba${index}`].messages.filter(message => message.indexOf('has been entered more than once') === -1);
          }
          if (!this.errorInline[errorKey].messages.length) {
            delete this.errorInline[errorKey];
          }
        }

        if (this.errorHeader.items.filter(x => x.id === errorKey).length) {
          const items = this.errorHeader.items.filter(x => x.id === errorKey);
          if (items[0].message.filter(m => m.indexOf('has been entered more than once') > -1).length) {
            items[0].message = items[0].message.filter(m => m.indexOf('has been entered more than once') === -1);
          }

          if (!items[0].message.length) {
            this.underscore().remove(this.errorHeader.items, { id: errorKey });
          }
        }
      }
    }

    duplicates.forEach(payment => {
      validation = false;
      for (let index = 0; index < paymentAccountComparables.length; index++) {
        const formControlsKeys = Object.keys(this.fPba).filter(control => control !== 'pbaNumbers');
        const errorKeys = formControlsKeys.filter((key) => this.fPba[key].value === paymentAccountComparables[index]);
        const lastDuplicateErrorKey = errorKeys[errorKeys.length - 1];
        const errorHeaderMessage = OrgManagerConstants.PBA_ERROR_ENTERED_MORE_THAN_ONCE_HEADER_MESSAGE[0].replace(OrgManagerConstants.PBA_MESSAGE_PLACEHOLDER, payment);
        const errorMessage = OrgManagerConstants.PBA_ERROR_ENTERED_MORE_THAN_ONCE_MESSAGE.replace(OrgManagerConstants.PBA_MESSAGE_PLACEHOLDER, payment);

        
        if (paymentAccountComparables[index] === payment) {
          if (this.errorHeader.items.filter(x => x.id === lastDuplicateErrorKey).length) {
            const pbaResult = this.errorHeader.items.filter(x => x.id === lastDuplicateErrorKey);
            const messageResult = pbaResult[0].message.filter(message => message === errorHeaderMessage);
            if (!messageResult.length) {
              pbaResult[0].message.push(errorHeaderMessage);
            }
          } else {
            this.errorHeader.items.push({ id: lastDuplicateErrorKey, message: [errorHeaderMessage] });
          }
          this.errorHeader.isFromValid = false;
          if (!this.errorInline[lastDuplicateErrorKey]) {
            this.errorInline[lastDuplicateErrorKey] = { messages: [errorMessage], isInvalid: true };
          } else {
            if (!this.errorInline[lastDuplicateErrorKey].messages.filter(message => message === errorMessage).length) {
              this.errorInline[lastDuplicateErrorKey].messages.push(errorMessage);
            }
            this.errorInline[lastDuplicateErrorKey].inInvalid = true;
          }
        } else {
          if (this.errorInline[lastDuplicateErrorKey]) {
            if (this.errorInline[lastDuplicateErrorKey].messages.filter(message => message === errorMessage).length) {
              this.errorInline[lastDuplicateErrorKey].messages = this.errorInline[`pba${index}`].messages.filter(message => message !== errorMessage);
            }

            if (!this.errorInline[lastDuplicateErrorKey].messages.length) {
              delete this.errorInline[lastDuplicateErrorKey];
            }
          }
        }
      }
    });

    if (!validation) {
      this.pbaErrorsHeader$ = of(this.errorHeader);
      this.pbaError$ = of(this.errorInline);
    }

    return validation;
  }

  public charactorLengthValidator(): boolean {
    let validation = true;
    const { value } = this.changePbaFG;
    const paymentAccounts: string[] = Object.keys(value).map(key => value[key]).filter(item => item !== '');
    const paymentAccountsWrapper = [...paymentAccounts];
    for (let index = 0; index < paymentAccountsWrapper.length; index++) {
      const formControlsKeys = Object.keys(this.fPba).filter(control => control !== 'pbaNumbers');
      const errorKeys = formControlsKeys.filter((key) => this.fPba[key].value === paymentAccountsWrapper[index]);
      const errorHeaderMessage = OrgManagerConstants.PBA_ERROR_MESSAGES[0].replace(OrgManagerConstants.PBA_MESSAGE_PLACEHOLDER, paymentAccountsWrapper[index]);
      const errorMessage = OrgManagerConstants.PBA_ERROR_MESSAGE.replace(OrgManagerConstants.PBA_MESSAGE_PLACEHOLDER, paymentAccountsWrapper[index]);
      this.errorHeader.header = 'There is a problem.';

      errorKeys.forEach((eKey) => {
        if (typeof paymentAccountsWrapper[index] === 'string' && paymentAccountsWrapper[index].length > 2 &&
        (paymentAccountsWrapper[index].length !== 10 || paymentAccountsWrapper[index].substring(0, 3) !== 'PBA')) {
          validation = false;

          if (this.errorHeader.items.filter(x => x.id === eKey).length) {
            const pbaResult = this.errorHeader.items.filter(x => x.id === eKey);
            const messageResult = pbaResult[0].message.filter(message => message === errorHeaderMessage);
            if (!messageResult.length) {
              pbaResult[0].message.push(errorHeaderMessage);
            }
          } else {
            this.errorHeader.items.push({ id: eKey, message: [errorHeaderMessage] });
          }
          this.errorHeader.isFromValid = false;

          if (!this.errorInline[eKey]) {
            this.errorInline[eKey] = { messages: [errorMessage], isInvalid: true };
            this.errorInline[eKey].inInvalid = true;
          } else {
            if (!this.errorInline[eKey].messages.filter(message => message === errorMessage).length) {
              this.errorInline[eKey].messages.push(errorMessage);
            }
            this.errorInline[eKey].inInvalid = true;
          }
        } else {
          if (this.errorInline[eKey]) {
            if (this.errorInline[eKey].messages.filter(message => message === errorMessage).length) {
              this.errorInline[eKey].messages = this.errorInline[eKey].messages.filter(message => message !== errorMessage);
            }

            if (!this.errorInline[eKey].messages.length) {
              delete this.errorInline[eKey];
            }
          }

          if (this.errorHeader.items.filter(x => x.id === eKey).length) {
            const items = this.errorHeader.items.filter(x => x.id === eKey);
            if (items[0].message.filter(m => m.indexOf('for example PBA1234567') > -1).length) {
              items[0].message = items[0].message.filter(m => m.indexOf('for example PBA1234567') === -1);
            }

            if (!items[0].message.length) {
              this.underscore().remove(this.errorHeader.items, { id: eKey });
            }
          }
        }
      });
    }

    if (!validation) {
      this.pbaErrorsHeader$ = of(this.errorHeader);
      this.pbaError$ = of(this.errorInline);
    }

    return validation;
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
