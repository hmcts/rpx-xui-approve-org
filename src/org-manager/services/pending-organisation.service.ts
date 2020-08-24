import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
import { Organisation } from '../models/organisation';

@Injectable()
export class PendingOrganisationService {
  public singleOrgUrl = environment.singleOrgUrl;
  public orgPendingUrl = environment.orgPendingUrl;
  public organisationsUrl = environment.organisationsUrl;

  constructor(private readonly http: HttpClient) {
  }

  public fetchPendingOrganisations(): Observable<Organisation[]> {
    return this.http.get<Organisation[]>(this.orgPendingUrl);
  }

  public getSingleOrganisation(payload): Observable<SingleOrgSummary> {
    return this.http.get<SingleOrgSummary>(`${this.singleOrgUrl}${payload.id}`);
  }

  public approvePendingOrganisations(payload: Organisation): Observable<Response> {
    return this.http.put<Response>(`${this.organisationsUrl}${payload.organisationIdentifier}`, payload);
  }

  public deletePendingOrganisations(payload: Organisation): Observable<Response> {
    return this.http.delete<Response>(`${this.organisationsUrl}${payload.organisationIdentifier}`);
  }
}

