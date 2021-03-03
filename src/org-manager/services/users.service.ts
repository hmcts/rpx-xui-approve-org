import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class UsersService {
	public orgUsersUrl: string = environment.organisationUsersUrl;
	public reinviteUserUrl: string = environment.reinviteUserUrl;
	constructor(private readonly http: HttpClient) {}

	public getOrganisationUsers(payload: string): Observable<any> {
		return this.http.get<any>(this.orgUsersUrl + payload);
	}

	public inviteUser(orgId: string, data): Observable<any> {
		return this.http.post<any>(this.reinviteUserUrl + orgId, data);
	}
}
