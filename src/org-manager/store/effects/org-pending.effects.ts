import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { PendingOrganisationService } from 'src/org-manager/services/pending-organisation.service';
import * as pendingOrgActions from '../../../org-manager/store/actions/org-pending.actions';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as fromRoot from '../../../app/store';
import { Organisation, OrganisationVM } from 'src/org-manager/models/organisation';

@Injectable()
export class PendingOrgEffects {
  constructor(
    private actions$: Actions,
    private pendingOrgService: PendingOrganisationService) { }

  @Effect()
  loadPendingOrgs$ = this.actions$.pipe(
    ofType(pendingOrgActions.PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS),
    switchMap(() => {
      return this.pendingOrgService.fetchPendingOrganisations().pipe(
        map(pendingOrganisations => new pendingOrgActions.LoadPendingOrganisationsSuccess(this.mapOrganisations(pendingOrganisations)),
        catchError(error => of(new pendingOrgActions.LoadPendingOrganisationsFail(error)))
      ));
    }));

  @Effect()
  approvePendingOrgs$ = this.actions$.pipe(
    ofType(pendingOrgActions.PendingOrgActionTypes.APPROVE_PENDING_ORGANISATIONS),
    map((action: pendingOrgActions.ApprovePendingOrganisations) => action.payload),
    switchMap(payload => {
      const pendingOrganisation = this.mapOrganisationsVm(payload)[0];
      return this.pendingOrgService.approvePendingOrganisations(pendingOrganisation).pipe(
        map(pendingOrganisations => new pendingOrgActions.ApprovePendingOrganisationsSuccess(pendingOrganisations)),
        catchError(error => of(new pendingOrgActions.ApprovePendingOrganisationsFail(error)))
      );
    })
  );

  @Effect()
  approvePendingOrgsSuccess$ = this.actions$.pipe(
    ofType(pendingOrgActions.PendingOrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS),
    map(() => {
      return new fromRoot.Go({ path: ['pending-organisations/approve-success'] });
    })
  );

  mapOrganisations(obj: Organisation[]): OrganisationVM[] {
    const organisationModel: OrganisationVM[] = [];
    obj.forEach((apiOrg) => {
      const organisation = new OrganisationVM();
      organisation.name = apiOrg.name;
      organisation.adminEmail = apiOrg.superUser.email;
      organisation.pbaNumber = apiOrg.paymentAccount;
      organisation.organisationId = apiOrg.organisationIdentifier;
      organisation.view = 'View';
      organisation.status = apiOrg.status;
      organisation.admin = `${apiOrg.superUser.firstName} ${apiOrg.superUser.lastName}`;
      organisation.dxNumber = apiOrg.contactInformation[0].dxAddress;
      organisation.address = `${apiOrg.contactInformation[0].addressLine1}, ${apiOrg.contactInformation[0].county},
      ${apiOrg.contactInformation[0].townCity}`;
      organisationModel.push(organisation);
    });

    return organisationModel;
  }

  mapOrganisationsVm(obj: OrganisationVM[]): Organisation[] {
    const organisations: Organisation[] = [];
    obj.forEach((org) => {
      const organisation: Organisation = {
        organisationIdentifier: org.organisationId,
        contactInformation: [{
          addressLine1: org.address,
          townCity: org.address,
          county: org.address,
          dxAddress: org.dxNumber
          }],
        superUser: {
          userIdentifier: org.admin,
          firstName: org.admin,
          lastName: org.admin,
          email: org.adminEmail
        },
        status: 'ACTIVE',
        name: org.name,
        paymentAccount: org.pbaNumber
      };
      organisations.push(organisation);
    });

    return organisations;
  }
}
