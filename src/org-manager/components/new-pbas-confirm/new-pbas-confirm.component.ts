import { Component, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  private subscription: Subscription;

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
      })
    });

    const payload = {
      pbaNumbers,
      orgId: this.org.organisationId
    }

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
          // TODO: Handle errors in unhappy path ticket (https://tools.hmcts.net/jira/browse/EUI-3673)
          // We will just log the error for now and simulate a happy path
          console.log(error);
          this.router.navigateByUrl('/organisation/pbas', {
            state: {
              notificationBanners: [{
                bannerType: NotificationBannerType.SUCCESS, bannerMessage: 'PBA numbers updated'
              }
              ],
            }
          });
        }
      });
  };

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
