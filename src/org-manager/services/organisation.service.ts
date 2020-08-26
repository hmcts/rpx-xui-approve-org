import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Organisation } from '../models/organisation';

@Injectable()
export class OrganisationService {

  public singleOrgUrl = environment.singleOrgUrl;
  public orgActiveUrl = environment.orgActiveUrl;
  public orgUsersUrl = environment.organisationUsersUrl;
  public organisationsUrl = environment.organisationsUrl;

  constructor(private readonly http: HttpClient) {
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
    // There is no direct PRD API call that AO users can use to check the status of a user, so the alternative is to
    // call the endpoint for getting all users of an active organisation, check there is one and only one user
    // (presumed to be the superuser), and check this user's status. An active organisation is deletable if the sole
    // user's status is "Pending". In all other scenarios, the organisation is not deletable.
    return this.http.get<any>(`${this.organisationsUrl}${payload}/users`);
  }
}
