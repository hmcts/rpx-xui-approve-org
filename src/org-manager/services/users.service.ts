import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class UsersService {
  public orgUsersUrl = environment.organisationUsersUrl;
  public reinviteUserUrl = environment.reinviteUserUrl;
  public orgUsersUrlWithoutRole = environment.organisationUsersUrlWithoutRole;
  constructor(private readonly http: HttpClient) {}

  public getOrganisationUsers(payload): Observable<any> {
    return this.http.get<any>(this.orgUsersUrl + payload);
  }

  public inviteUser(orgId, data): Observable<any> {
    return this.http.post<any>(this.reinviteUserUrl + orgId, data);
  }

  public getAllUsersList(orgId): Observable<any> {
    return this.http.get<any>(this.orgUsersUrlWithoutRole + orgId);
  }
}
