import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Organisation } from '../models/organisation';

@Injectable()
export class OrganisationService {
  private readonly _singleOrgUrl = environment.singleOrgUrl;
  private readonly _orgActiveUrl = environment.orgActiveUrl;
  constructor(private readonly _http: HttpClient) {
  }

  public fetchOrganisations(): Observable<Organisation[]> {
    const organisations$ = this._http.get<Organisation[]>(this._orgActiveUrl);
    return organisations$;
  }

  public getSingleOrganisation(payload: { id: number | string}): Observable<Organisation> {
    return this._http.get<Organisation>(this._singleOrgUrl + payload.id);
  }

}
