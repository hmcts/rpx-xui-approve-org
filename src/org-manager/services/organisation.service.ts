import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Organisation } from '../models/organisation';

@Injectable()
export class OrganisationService {
  private readonly singleOrgUrl = environment.singleOrgUrl;
  private readonly orgActiveUrl = environment.orgActiveUrl;
  private readonly orgUsersUrl = environment.organisationUsersUrl;
  constructor(private readonly http: HttpClient) {
  }

  public fetchOrganisations(): Observable<Organisation[]> {
    const organisations$ = this.http.get<Organisation[]>(this.orgActiveUrl);
    return organisations$;
  }

  public getSingleOrganisation(payload): Observable<Organisation> {
    return this.http.get<Organisation>(this.singleOrgUrl + payload.id);
  }

  public getOrganisationUsers(payload): Observable<any> {
    return this.http.get<any>(this.orgUsersUrl + payload);
  }

}
