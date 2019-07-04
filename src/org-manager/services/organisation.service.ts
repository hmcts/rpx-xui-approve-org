import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, noop, pipe } from 'rxjs';
import { OrganisationsMock } from '../mock/organisation.mock';
import { Organisation, OrganisationVM } from '../models/organisation';
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

  fetchOrganisations(): Observable<Array<Organisation>> {
    const organisations$ = this.http.get<Organisation[]>('api/Organisations')
    return organisations$
  }

  getSingleOrganisation(payload): Observable<SingleOrgSummary> {
    return this.http.get<SingleOrgSummary>(this.singleOrgUrl + payload.id);
  }

}
