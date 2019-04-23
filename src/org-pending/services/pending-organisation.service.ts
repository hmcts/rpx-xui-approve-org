import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PendingOrganisationsMock } from '../mock/pending-organisation.mock';
import { PendingOrganisation } from '../models/pending-organisation';


@Injectable()
export class PendingOrganisationService {
  constructor(private http: HttpClient) {
  }

  fetchOrganisations(): Observable<Array<PendingOrganisation>> {
    const obj: PendingOrganisation[] = PendingOrganisationsMock;
    console.log('returning pending org mock')
    return of(obj);
  }

}

