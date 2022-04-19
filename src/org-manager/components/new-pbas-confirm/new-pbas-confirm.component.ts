import { Component, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { handleFatalErrors, WILDCARD_SERVICE_DOWN } from 'src/caseworker-ref-data/utils/caseworker-utils';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import { NotificationBannerType } from '../../../models/notification-banner-type.enum';
import { PbaService } from '../../services';

@Component({
  selector: 'app-new-pbas-confirm',
  templateUrl: './new-pbas-confirm.component.html'
})
export class NewPBAsConfirmComponent implements OnDestroy {

  @Input() public org: OrganisationVM;
  @Input() public formControls: FormControl[];
  @Input() public newPBAs: Map<string, string>;
  @Input() public decision: string[] = ['Reject', 'Approve'];
  private subscription: Subscription;
  public pbaSelected: string[] = [];
  public accountSelected: string[] = [];

  constructor(
    private readonly router: Router,
    private readonly pbaService: PbaService
  ) {
  }

  public confirmPBAs(): void {
    const pbaNumbers = [];

    this.newPBAs.forEach((value: string, key: string) => {
      pbaNumbers.push({
        pbaNumber: key,
        status: value,
        statusMessage: ''
      });
    });

    const payload = {
      pbaNumbers,
      orgId: this.org.organisationId
    };

    this.subscription = this.pbaService.setPBAStatus(payload)
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/organisation/pbas', {
            state: {
              notificationBanners: [{
                bannerType: NotificationBannerType.SUCCESS, bannerMessage: 'PBA numbers updated'
              }
              ],
            }
          });
        },
        error: (error: any) => {
          handleFatalErrors(error.status, this.router, WILDCARD_SERVICE_DOWN);
        }});
  }

  public get orgFiltered(): OrganisationVM {
    if (!this.pbaSelected.length) {
      this.org.pbaNumber = [];
      this.org.accountDetails = [];
      this.newPBAs.forEach((value, key) => {
            this.pbaSelected.push(key);
            this.accountSelected.push('');
      });
      this.org.accountDetails = this.accountSelected;
      this.org.pbaNumber = this.pbaSelected;
    }

    return this.org;
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
