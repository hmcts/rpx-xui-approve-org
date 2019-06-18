import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PendingOrganisation } from '../models/pending-organisation';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
import { environment } from 'src/environments/environment';

@Injectable()
export class PendingOrganisationService {
  private singleOrgUrl = environment.singleOrgUrl;
  private orgPendingUrl = environment.orgPendingUrl;
  private orgApprovePendingUrl = environment.orgApprovePendingUrl;
  constructor(private http: HttpClient) {
  }

  fetchPendingOrganisations(): Observable<Array<PendingOrganisation>> {
    return this.http.get<PendingOrganisation[]>(this.orgPendingUrl);
  }

  getSingleOrganisation(payload): Observable<SingleOrgSummary> {
    return this.http.get<SingleOrgSummary>(this.singleOrgUrl + payload.id);
  }

  approvePendingOrganisations(payload): Observable<Response> {
    return this.http.put<Response>(this.orgApprovePendingUrl, payload);
  }

}

