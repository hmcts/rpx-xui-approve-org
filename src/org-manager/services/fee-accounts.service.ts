import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {PbaAccountsMock} from '../mock/pba-accounts.mock';
import {PbaAccounts} from '../models/pba-accounts';

@Injectable()
export class FeeAccountsService {
  constructor(private http: HttpClient) {
  }

  fetchFeeAccounts(): Observable<Array<PbaAccounts>> {
    const obj: PbaAccounts[] = PbaAccountsMock;
    return of(obj);
  }
}

