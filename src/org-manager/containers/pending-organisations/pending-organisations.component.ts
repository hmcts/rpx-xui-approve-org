import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '@hmcts/rpx-xui-common-lib';
import { SessionStorageService } from '../../../shared/services/session-storage.service';
import { OrganisationService } from '../../services';
import { OrganisationListComponent } from './../organisation-list/organisation-list.component';

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-organisations.component.html',
  styleUrls: [ '../organisation-list/organisation-list.component.scss' ]
})
export class PendingOrganisationsComponent extends OrganisationListComponent implements OnInit {

  constructor(
    protected router: Router,
    protected ref: ChangeDetectorRef,
    protected organisationService: OrganisationService,
    protected loadingService: LoadingService,
    protected sessionStorageService: SessionStorageService
  ) {
    super(router, ref, organisationService, loadingService, sessionStorageService);
  }

  public ngOnInit(): void {
    this.view = 'NEW'
    super.ngOnInit();
  }
}
