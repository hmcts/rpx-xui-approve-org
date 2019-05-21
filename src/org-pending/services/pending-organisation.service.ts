import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PendingOrganisationsMock } from '../mock/pending-organisation.mock';
import { PendingOrganisation } from '../models/pending-organisation';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
import { environment } from 'src/environments/environment';


@Injectable()
export class PendingOrganisationService {
  private singleOrgUrl = environment.singleOrgUrl;
  constructor(private http: HttpClient) {
  }

  fetchPendingOrganisations(): Observable<Array<PendingOrganisation>> {
    const obj: PendingOrganisation[] = PendingOrganisationsMock;
    return of(obj);
  }

  getSingleOrganisation(payload): Observable<SingleOrgSummary> {
    return this.http.get<SingleOrgSummary>(this.singleOrgUrl + payload.id);
  }

}

