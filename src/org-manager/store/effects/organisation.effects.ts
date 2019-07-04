import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as organisationActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import { OrganisationService } from '../../services';
import { OrganisationVM, Organisation } from 'src/org-manager/models/organisation';



@Injectable()
export class OrganisationEffects {
  constructor(
    private actions$: Actions,
    private organisationService: OrganisationService
  ) {}

  @Effect()
  loadOrganisations$ = this.actions$.pipe(
    ofType(organisationActions.LOAD_ORGANISATIONS),
    switchMap(() => {
      return this.organisationService.fetchOrganisations().pipe(
        map(organisationDetails => new organisationActions.LoadOrganisationSuccess(this.mapOrganisations(organisationDetails))),
        catchError(error => of(new organisationActions.LoadOrganisationFail(error)))
      );
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
}
