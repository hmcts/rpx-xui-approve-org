import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { OrganisationsMock } from '../mock/organisation.mock';
import { Organisation } from '../models/organisation';
import {SingleAccontSummary} from '../models/single-account-summary';
import {SingleAccontSummaryMock} from '../mock/sngleAccontSummary.mock';

@Injectable()
export class OrganisationService {
  constructor(private http: HttpClient) {
  }

  fetchOrganisations(): Observable<Array<Organisation>> {
    const obj: Organisation[] = OrganisationsMock;
    return of(obj);
  }

  // Overview load
  fetchSingleFeeAccount(payload): Observable<SingleAccontSummary> {
    const obj: SingleAccontSummary = SingleAccontSummaryMock;
    return of(obj);
    // return this.http.get(`/api/accounts/${payload.id}`);
  }
}

