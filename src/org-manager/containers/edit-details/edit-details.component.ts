import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AppUtils } from 'src/app/utils/app-utils';
import { UpdatePbaServices } from 'src/org-manager/services';
import { OrgManagerConstants } from '../../org-manager.constants';
import { OrganisationService } from '../../services/organisation.service';
@Component({
  selector: 'app-change-details',
  templateUrl: './edit-details.component.html'
})
export class EditDetailsComponent implements OnInit, OnDestroy {
  public changePbaFG: FormGroup;
  public pbaInputs: { config: { name: string } }[];
  public pbaError$: Observable<object>;
  public pbaErrorsHeader$: Observable<any>;
  public orgDetails$: Observable<any>;
  private subscriptions: Subscription;
  public orgId: string;
  public pbaNumbers: string[];
  public saveDisabled = true;
  public serverError$: Observable<{ type: string; message: string }>;
  public routeSubscripton: Subscription;
  public pda: any;

  constructor(
    private readonly organisationService: OrganisationService,
    private readonly updatePbaServices: UpdatePbaServices,
    private readonly route: ActivatedRoute) {
    this.routeSubscripton = this.route.params.subscribe(params => {
      this.orgId = params.orgId;
      this.pda = params.id;
    });
  }

  public ngOnInit(): void {
    this.pbaInputs = OrgManagerConstants.PBA_INPUT_FEED;
    this.changePbaFG = new FormGroup({});
    this.getOrg();
    this.createPbaForm();
  }

  private getOrg(): void {
    this.orgDetails$ = this.organisationService.getSingleOrganisation({ id: this.orgId })
      .pipe(map(apiOrg => AppUtils.mapOrganisation(apiOrg)), tap(org => {
        if (org) {
          this.orgId = org.organisationId;
          this.pbaNumbers = org.pbaNumber;
          this.saveDisabled = !org.pbaNumber;
        }
      }));
  }

  public createPbaForm(): void {
    for (const inputs of this.pbaInputs) {
      this.changePbaFG.addControl(inputs.config.name, new FormControl(''));
      const validators = [
        Validators.pattern(/(PBA\w*)/i),
        Validators.minLength(10),
        Validators.maxLength(10)
      ];
      this.changePbaFG.controls[inputs.config.name].setValidators(validators);
      this.changePbaFG.controls[inputs.config.name].updateValueAndValidity();
    }

    if (this.pda) {
      this.pda.split(',').map((p, i) => {
        this.changePbaFG.patchValue({ [`pba${i + 1}`]: p });
      });
    }

    this.subscriptions = this.changePbaFG.valueChanges.subscribe(value => {
      const pba: string[] = Object.keys(value).map(key => value[key]).filter(item => item !== '');
      const isNewPba = JSON.stringify(this.pbaNumbers) === JSON.stringify(pba);
      this.saveDisabled = !isNewPba;
    });

  }

  public get fPba() { return this.changePbaFG.controls; }

  public onSubmitPba(): void {
    this.dispatchStoreValidation();
    const { valid, value } = this.changePbaFG;
    const paymentAccounts: string[] = Object.keys(value).map(key => value[key]).filter(item => item !== '');
    if (valid) {
      this.updatePbaServices.updatePba(({ paymentAccounts, orgId: this.orgId })).subscribe(() => this.onGoBack());
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
  }

  public ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
    if (this.routeSubscripton) {
      this.routeSubscripton.unsubscribe();
    }
  }

  public onGoBack() {
    window.history.back();
  }
}
