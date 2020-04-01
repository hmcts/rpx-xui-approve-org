import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class UsersService {

  public orgUsersUrl = environment.organisationUsersUrl;
  public reinviteUserUrl = environment.reinviteUserUrl;
  constructor(private readonly http: HttpClient) {
  }

  public getOrganisationUsers(payload): Observable<any> {
    return this.http.get<any>(this.orgUsersUrl + payload);
  }

  public inviteUser(orgId, data): Observable<any> {
    console.log('invite user srevice', this.reinviteUserUrl);
    return this.http.post<any>(this.reinviteUserUrl + orgId, data);
  }

}
