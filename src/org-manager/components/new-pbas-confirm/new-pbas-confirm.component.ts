import { Component, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { handleFatalErrors, WILDCARD_SERVICE_DOWN } from 'src/caseworker-ref-data/utils/caseworker-utils';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import { NotificationBannerType } from '../../../models/notification-banner-type.enum';
import { NewPbaPayLoad } from '../../models/new-pba-payload.model';
import { PbaService } from '../../services';

@Component({
  selector: 'app-new-pbas-confirm',
  templateUrl: './new-pbas-confirm.component.html'
})
export class NewPBAsConfirmComponent implements OnDestroy {

  @Input() public org: OrganisationVM;
  @Input() public formControls: FormControl[];
  @Input() public newPBAs: NewPbaPayLoad[];
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
    this.newPBAs.forEach(newPBA => {
      pbaNumbers.push({
        pbaNumber: newPBA.pbaNumber,
        status: newPBA.decision,
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
      this.newPBAs.forEach(newPBA => {
            this.pbaSelected.push(newPBA.pbaNumber);
            this.accountSelected.push(newPBA.accountName);
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
