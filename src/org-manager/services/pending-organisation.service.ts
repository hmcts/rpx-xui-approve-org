import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
import { Organisation } from '../models/organisation';

@Injectable()
export class PendingOrganisationService {
  private readonly _singleOrgUrl = environment.singleOrgUrl;
  private readonly _orgPendingUrl = environment.orgPendingUrl;
  private readonly _orgApprovePendingUrl = environment.orgApprovePendingUrl;

  constructor(private readonly _http: HttpClient) {
  }

  public fetchPendingOrganisations(): Observable<Organisation[]> {
    return this._http.get<Organisation[]>(this._orgPendingUrl);
  }

  public getSingleOrganisation(payload: { id: number | string }): Observable<SingleOrgSummary> {
    return this._http.get<SingleOrgSummary>(this._singleOrgUrl + payload.id);
  }

  public approvePendingOrganisations(payload: Organisation): Observable<Response> {
    return this._http.put<Response>(this._orgApprovePendingUrl + payload.organisationIdentifier, payload);
  }

}

