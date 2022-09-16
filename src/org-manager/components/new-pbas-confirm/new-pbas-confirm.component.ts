import { AfterContentInit, Component, Input, OnDestroy } from '@angular/core';
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
  private subscription: Subscription;
  public isInactiveOrgError: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly pbaService: PbaService
  ) {
  }

  public confirmPBAs(): void {
    const pbaNumbers = [];
    this.isInactiveOrgError = false;
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
          if (error.status === 400 && error.error.errorDescription === 'The requested Organisation is not \'Active\'') {
            this.isInactiveOrgError = true;
          } else {
            handleFatalErrors(error.status, this.router, WILDCARD_SERVICE_DOWN);
          }
        }});
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
