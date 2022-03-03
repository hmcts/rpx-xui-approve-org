import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchOrganisationRequest } from '../../models/dtos';
import { Organisation } from '../models/organisation';

@Injectable()
export class OrganisationService {

  public singleOrgUrl = environment.singleOrgUrl;
  public orgActiveUrl = environment.orgActiveUrl;
  public orgPendingUrl = environment.orgPendingUrl;
  public orgUsersUrl = environment.organisationUsersUrl;
  public organisationsUrl = environment.organisationsUrl;
  private organisationSearchString: Subject<string> = new Subject<string>();
  constructor(private readonly http: HttpClient) {
  }

  public organisationSearchStringChange() {
    return this.organisationSearchString.asObservable();
  }

  public setOrganisationSearchString(value: string) {
    this.organisationSearchString.next(value || '');
  }

  public fetchOrganisations(): Observable<Organisation[]> {
    const organisations$ = this.http.get<Organisation[]>(this.orgActiveUrl);
    return organisations$;
  }

  public getSingleOrganisation(payload): Observable<Organisation> {
    return this.http.get<Organisation>(`${this.singleOrgUrl}${payload.id}`);
  }

  public getOrganisationUsers(payload): Observable<any> {
    return this.http.get<any>(`${this.orgUsersUrl}${payload}`);
  }

  public deleteOrganisation(payload: Organisation): Observable<Response> {
    return this.http.delete<Response>(`${this.organisationsUrl}${payload.organisationIdentifier}`);
  }

  public getOrganisationDeletableStatus(payload: string): Observable<any> {
    // An active organisation is deletable if the sole user's status is "Pending". In all other scenarios, the
    // organisation is not deletable.
    return this.http.get<any>(`${this.organisationsUrl}${payload}/isDeletable`);
  }

  public searchOrganisationWithPagination(body: { searchRequest: SearchOrganisationRequest, view: string }): Observable<Organisation[]> {
    return this.http.post<Organisation[]>(body.view === 'NEW' ? this.orgPendingUrl : this.orgActiveUrl, body);
  }

}
