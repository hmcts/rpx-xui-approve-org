import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppUtils } from '../../../app/utils/app-utils';
import { OrganisationUpdateStatus } from '../../components/organisation-update-table/organisation-update-table.component';
import { OrganisationVM } from '../../models/organisation';
import { OrganisationService } from '../../services/organisation.service';

@Component({
  selector: 'app-organisation-update-review',
  templateUrl: './organisation-update-review.component.html',
  standalone: false
})
export class OrganisationUpdateReviewComponent implements OnInit {
  public orgs$: Observable<OrganisationVM> = new Observable<OrganisationVM>();
  public requestedStatus: OrganisationUpdateStatus = 'PENDING';
  public readonly orgId: string;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly organisationService: OrganisationService
  ) {
    this.orgId = this.route.snapshot.paramMap.get('orgId') || '';
  }

  public ngOnInit(): void {
    this.orgs$ = this.organisationService.getOrganisationUpdate({ id: this.orgId }).pipe(
      map((organisation) => AppUtils.mapOrganisation(organisation))
    );
  }

  public acceptUpdate(): void {
    this.router.navigateByUrl('/organisation-update-accepted');
  }

  public rejectUpdate(): void {
    this.router.navigateByUrl('/organisation-update-rejected');
  }

  public onGoBack(): void {
    this.router.navigateByUrl('/organisation/updates');
  }
}
