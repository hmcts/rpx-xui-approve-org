import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { OrganisationsMock } from '../mock/organisation.mock';
import { Organisation } from '../models/organisation';
import {SingleOrgSummary} from '../models/single-org-summary';
import {SingleOrgSummaryMock} from '../mock/single-org-summary.mock';

@Injectable()
export class OrganisationService {
  constructor(private http: HttpClient) {
  }

  fetchOrganisations(): Observable<Array<Organisation>> {
    const obj: Organisation[] = OrganisationsMock;
    return of(obj);
  }

  // Overview load
  fetchSingleOrg(payload): Observable<SingleOrgSummary> {
    const obj: SingleOrgSummary = SingleOrgSummaryMock;
    console.log("payload is " + payload.id)
    return of(obj);
    // return this.http.get(`/api/accounts/${payload.id}`);
  }
  
}

