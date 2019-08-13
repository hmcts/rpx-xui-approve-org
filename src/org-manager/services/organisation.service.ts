import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organisation } from '../models/organisation';
import { environment } from '../../environments/environment';

@Injectable()
export class OrganisationService {
  private singleOrgUrl = environment.singleOrgUrl;
  private orgActiveUrl = environment.orgActiveUrl;
  constructor(private http: HttpClient) {
  }

  fetchOrganisations(): Observable<Array<Organisation>> {
    const organisations$ = this.http.get<Organisation[]>(this.orgActiveUrl);
    return organisations$;
  }

  getSingleOrganisation(payload): Observable<Organisation> {
    return this.http.get<Organisation>(this.singleOrgUrl + payload.id);
  }

}
