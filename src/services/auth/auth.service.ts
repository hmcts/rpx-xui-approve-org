import {Injectable} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpClient
  ) {
  }

  public loginRedirect() {
    window.location.href = '/auth/login';
  }

 public isAuthenticated(): Observable<boolean> {
    return this.httpService.get<boolean>('/auth/isAuthenticated');
  }
}
