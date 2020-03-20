import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
import { environment } from 'src/environments/environment';
import { Organisation, OrganisationVM } from '../models/organisation';

@Injectable()
export class PendingOrganisationService {
  singleOrgUrl = environment.singleOrgUrl;
  orgPendingUrl = environment.orgPendingUrl;
  orgApprovePendingUrl = environment.orgApprovePendingUrl;
  constructor(private http: HttpClient) {
  }

  fetchPendingOrganisations(): Observable<Array<Organisation>> {
    return this.http.get<Organisation[]>(this.orgPendingUrl);
  }

  getSingleOrganisation(payload): Observable<SingleOrgSummary> {
    return this.http.get<SingleOrgSummary>(this.singleOrgUrl + payload.id);
  }

  approvePendingOrganisations(payload: Organisation): Observable<Response> {
    return this.http.put<Response>(this.orgApprovePendingUrl + payload.organisationIdentifier, payload);
  }

}

