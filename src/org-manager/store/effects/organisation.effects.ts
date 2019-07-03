import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as organisationActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import { OrganisationService } from '../../services';
import { organisationVM, Organisation } from 'src/org-manager/models/organisation';



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
  )

  mapOrganisations(obj: Organisation[]) : organisationVM[] {
    let organisationModel: organisationVM[] = []
    obj.forEach((curr) => {
      const organisation = new organisationVM()
      organisation.organisationId = curr.organisationIdentifier
      organisation.status = curr.status
      organisation.admin = `${curr.superUser.firstName} ${curr.superUser.lastName}`
      organisation.address = `${curr.contactInformation[0].addressLine1}, ${curr.contactInformation[0].county}, ${curr.contactInformation[0].townCity}`
      organisationModel.push(organisation)
    })

    return organisationModel;
  }
}
