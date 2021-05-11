import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, takeWhile } from 'rxjs/operators';

import { OrganisationVM } from '../../models/organisation';
import { PbaService } from '../../services';
import * as fromStore from '../../store';

@Component({
  selector: 'app-pending-pbas',
  templateUrl: './pending-pbas.component.html',
})
export class PendingPBAsComponent implements OnInit, OnDestroy {
  public static PENDING_STATUS: string = 'pending';

  public orgs$: Observable<OrganisationVM[]>;
  public orgsWithPendingPBAs: any[];
  public organisationFilter: string;
  public get pendingPBAsCount(): number {
    if (this.orgsWithPendingPBAs) {
      return this.orgsWithPendingPBAs.reduce((count, org) => {
        return count + org.pbaNumbers.length;
      }, 0);
    }
    return -1;
  }

  private getActiveLoadedSubscription: Subscription;

  constructor(
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly pbaService: PbaService,
    private readonly router: Router // Temporarily here for testing purposes.
  ) {}

  public ngOnInit(): void {
    this.loadPendingPBAs();
  }

  public ngOnDestroy(): void {
    if (this.getActiveLoadedSubscription) {
      this.getActiveLoadedSubscription.unsubscribe();
    }
  }

  private loadPendingPBAs(): void {
    const status = this.getStatus();
    this.pbaService.getPBAsByStatus(status).subscribe({
      next: (pendingPBAs: any[]) => {
        if (pendingPBAs && pendingPBAs.length > 0) {
          const orgIds = pendingPBAs.map(org => org.organisationIdentifier);
          this.getActiveLoadedSubscription = this.store
            .pipe(select(fromStore.getActiveLoaded))
            .pipe(takeWhile(loaded => !loaded)).subscribe({
              next: loaded => {
                if (!loaded) {
                  this.store.dispatch(new fromStore.LoadActiveOrganisation());
                }
              }
          });
          this.orgs$ = this.store.pipe(select(fromStore.getActiveByOrgIds, { orgIds }));
          this.orgs$.pipe(filter(orgs => orgs.length > 0)).subscribe({
            next: (orgs: OrganisationVM[]) => {
              this.orgsWithPendingPBAs = orgs.map(org => {
                const withPBAs = pendingPBAs.find(pending => pending.organisationIdentifier === org.organisationId);
                return this.toRenderableOrganisation(org, withPBAs);
              });
            },
            error: (error: any) => {
              console.log('Error getting active organisations', error);
            }
          })
        } else {
          this.orgsWithPendingPBAs = [];
        }
      },
      error: (error: any) => {
        console.log('Error getting PBAs by status:', status, error);
      }
    });
  }

  private toRenderableOrganisation(raw: any, withPBAs: any): any {
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
  private getReceivedDate(pbaNumbers: { dateCreated: string }[]): string {
    return pbaNumbers.reduce((currentEarliest: string, number: { dateCreated: string }) => {
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
}
