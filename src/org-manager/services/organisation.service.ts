import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, noop, pipe } from 'rxjs';
import { OrganisationsMock } from '../mock/organisation.mock';
import { Organisation, organisationVM } from '../models/organisation';
import {SingleOrgSummary} from '../models/single-org-summary';
import {SingleOrgSummaryMock} from '../mock/single-org-summary.mock';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class OrganisationService {
  private singleOrgUrl = environment.singleOrgUrl;
  private orgActiveUrl = environment.orgActiveUrl;
  constructor(private http: HttpClient) {
  }

  fetchOrganisations(): Observable<Array<organisationVM>> {
    const obj: Organisation[] = OrganisationsMock;

    let organisationModel: organisationVM[] = []
    obj.forEach((curr) => {
      let organisation = new organisationVM()
      organisation.organisationId = curr.organisationIdentifier
      organisation.status = curr.status
      organisation.admin = `${curr.superUser.firstName} ${curr.superUser.lastName}`
      organisation.address = `${curr.contactInformation[0].addressLine1}, ${curr.contactInformation[0].county}, ${curr.contactInformation[0].townCity}`
      organisationModel.push(organisation);
    });

    return of(organisationModel);
  }

  getSingleOrganisation(payload): Observable<SingleOrgSummary> {
    return this.http.get<SingleOrgSummary>(this.singleOrgUrl + payload.id);
  }

}

