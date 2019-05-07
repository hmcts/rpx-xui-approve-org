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
  private organisationUrl = 'http://localhost:3000/organisations?pbaNumber=';
  constructor(private http: HttpClient) {
  }

  fetchOrganisations(): Observable<Array<Organisation>> {
    const obj: Organisation[] = OrganisationsMock;
    return of(obj);
  }

  getSingleOrganisation(payload): Observable<SingleOrgSummary> {
    return this.http.get<SingleOrgSummary>(this.organisationUrl+payload.id).pipe(
      tap(data => console.log('All: ' + JSON.stringify(data[0]))),
      catchError(this.handleError)
    );
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
  
}

