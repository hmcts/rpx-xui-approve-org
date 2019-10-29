import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
import { Organisation } from '../models/organisation';

@Injectable()
export class PendingOrganisationService {
  private readonly singleOrgUrl = environment.singleOrgUrl;
  private readonly orgPendingUrl = environment.orgPendingUrl;
  private readonly orgApprovePendingUrl = environment.orgApprovePendingUrl;

  constructor(private readonly http: HttpClient) {
  }

  public fetchPendingOrganisations(): Observable<Organisation[]> {
    return this.http.get<Organisation[]>(this.orgPendingUrl);
  }

  public getSingleOrganisation(payload: { id: number | string }): Observable<SingleOrgSummary> {
    return this.http.get<SingleOrgSummary>(this.singleOrgUrl + payload.id);
  }

  public approvePendingOrganisations(payload: Organisation): Observable<Response> {
    return this.http.put<Response>(this.orgApprovePendingUrl + payload.organisationIdentifier, payload);
  }

}

