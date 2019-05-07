import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { OrganisationsMock } from '../mock/organisation.mock';
import { Organisation } from '../models/organisation';
import {SingleOrgSummary} from '../models/single-org-summary';
import {SingleOrgSummaryMock} from '../mock/single-org-summary.mock';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class OrganisationService {
  private singleOrgUrl = 'http://localhost:3000/organisations?pbaNumber=';
  constructor(private http: HttpClient) {
  }

  fetchOrganisations(): Observable<Array<Organisation>> {
    const obj: Organisation[] = OrganisationsMock;
    return of(obj);
  }

  getSingleOrganisation(payload): Observable<SingleOrgSummary> {
    return this.http.get<SingleOrgSummary>(this.singleOrgUrl+payload.id)
  }

}

