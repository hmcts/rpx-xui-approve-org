import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, takeWhile } from 'rxjs/operators';

import { OrganisationVM } from '../../models/organisation';
import { PbaService } from '../../services';
import * as fromStore from '../../store';
import { OrganisationModel, PBANumberModel, RenderableOrganisation } from './models';

@Component({
  selector: 'app-pending-pbas',
  templateUrl: './pending-pbas.component.html',
})
export class PendingPBAsComponent implements OnInit, OnDestroy {
  public static PENDING_STATUS: string = 'pending';

  public orgsWithPendingPBAs: RenderableOrganisation[];
  public get pendingPBAsCount(): number {
    if (this.orgsWithPendingPBAs) {
      return this.orgsWithPendingPBAs.reduce((count, org) => {
        return count + org.pbaNumbers.length;
      }, 0);
    }
    return -1;
  }

  private getActiveLoadedSubscription: Subscription;
  private getActiveOrganisationsSubscription: Subscription;

  constructor(
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly pbaService: PbaService,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    this.loadPendingPBAs();
  }

  public ngOnDestroy(): void {
    if (this.getActiveLoadedSubscription) {
      this.getActiveLoadedSubscription.unsubscribe();
    }
    if (this.getActiveOrganisationsSubscription) {
      this.getActiveOrganisationsSubscription.unsubscribe();
    }
  }

  public handleLoadedActiveOrganisations(active: OrganisationVM[], pending: OrganisationModel[]): void {
    this.orgsWithPendingPBAs = active.map(a => {
      const withPBAs = pending.find(p => p.organisationIdentifier === a.organisationId);
      if (withPBAs) {
        return this.toRenderableOrganisation(a, withPBAs);
      }
      return undefined;
    }).filter(org => !!org);
  }

  private loadPendingPBAs(): void {
    const status = this.getStatus();
    this.pbaService.getPBAsByStatus(status).subscribe({
      next: (pendingPBAs: OrganisationModel[]) => {
        if (pendingPBAs && pendingPBAs.length > 0) {
          this.handlePendingPBAs(pendingPBAs);
        } else {
          this.handleNoPendingPBAs();
        }
      },
      error: (error: any) => {
        this.handleError(`Error getting PBAs by status: ${status}`, error);
      }
    });
  }

  private handleNoPendingPBAs(): void {
    this.orgsWithPendingPBAs = [];
  }

  private handlePendingPBAs(pendingPBAs: OrganisationModel[]): void {
    this.ensureActiveOrganisationsLoaded();
    const orgIds = pendingPBAs.map(org => org.organisationIdentifier);
    this.getActiveOrganisationsSubscription = this.store
      .pipe(select(fromStore.getActiveByOrgIds, { orgIds }))
      .pipe(filter(orgs => orgs.length > 0))
      .subscribe({
        next: (orgs: OrganisationVM[]) => {
          this.handleLoadedActiveOrganisations(orgs, pendingPBAs);
        },
        error: (error: any) => {
          this.handleError('Error getting active organisations', error);
        }
      });
  }

  private ensureActiveOrganisationsLoaded(): void {
    this.getActiveLoadedSubscription = this.store
      .pipe(select(fromStore.getActiveLoaded))
      .pipe(takeWhile(loaded => !loaded))
      .subscribe({
        next: loaded => {
          if (!loaded) {
            this.store.dispatch(new fromStore.LoadActiveOrganisation());
          }
        },
        error: (error: any) => {
          this.handleError('Error getting loaded state for active organisations', error);
        }
      });
  }

  private toRenderableOrganisation(raw: OrganisationVM, withPBAs: OrganisationModel): RenderableOrganisation {
    return {
      ...raw,
      pbaNumbers: withPBAs.pbaNumbers,
      receivedDate: this.getReceivedDate(withPBAs.pbaNumbers)
    };
  }

  /**
   * For a given set of PBA numbers, choose the earliest dateCreated.
   * @param pbaNumbers The numbers, each of which will have a dateCreated property.
   */
  private getReceivedDate(pbaNumbers: PBANumberModel[]): string {
    return pbaNumbers.reduce((currentEarliest: string, number: PBANumberModel) => {
      const epoch = Date.parse(number.dateCreated);
      const earliest = Date.parse(currentEarliest);
      if (epoch < earliest) {
        return new Date(epoch).toISOString();
      }
      return currentEarliest;
    }, new Date().toISOString());
  }

  private getStatus(): string {
    const statusModifier = this.router.routerState.snapshot.root.queryParams['status'];
    return statusModifier || PendingPBAsComponent.PENDING_STATUS;
  }

  private handleError(message: string, error: any): void {
    if (error && error.status) {
      console.error(message, error);
      switch (error.status) {
        case 401:
        case 403:
          this.router.navigateByUrl('/not-authorised');
          break;
        case 500:
          this.router.navigateByUrl('/service-down');
          break;
        default:
          // TODO: Specific 400 error handling needed. "Something went wrong"?
          this.router.navigateByUrl('/service-down');
          break;
      }
    }
  }
}
