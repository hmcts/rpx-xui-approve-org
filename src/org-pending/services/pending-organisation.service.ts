import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PendingOrganisationsMock } from '../mock/pending-organisation.mock';
import { PendingOrganisation } from '../models/pending-organisation';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
import { environment } from 'src/environments/environment';
import { p } from '@angular/core/src/render3';
import { map } from 'rxjs/operators';


@Injectable()
export class PendingOrganisationService {
  private singleOrgUrl = environment.singleOrgUrl;
  private orgPendingUrl = environment.OrgPendingUrl;
  constructor(private http: HttpClient) {
  }

  fetchPendingOrganisations(): Observable<Array<PendingOrganisation>> {
    const obj: PendingOrganisation[] = PendingOrganisationsMock;
    return this.http.get<PendingOrganisation[]>(this.orgPendingUrl);
    //return of(obj);
  }

  getSingleOrganisation(payload): Observable<SingleOrgSummary> {
    console.log('i get',this.http.get<SingleOrgSummary>(this.singleOrgUrl + payload.id))
    return this.http.get<SingleOrgSummary>(this.singleOrgUrl + payload.id);
  }

  fetchPendingOrganisationsCount(): any {
    let pendingOrganisationsCount = this.fetchPendingOrganisations()
    //console.log('pending org count is',pendingOrganisationsCount)
    //console.log('pending org count is',pendingOrganisationsCount.length)
    return pendingOrganisationsCount;
    //return of('1');
  }

}

