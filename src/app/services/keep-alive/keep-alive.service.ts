import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';

@Injectable()
export class LogOutKeepAliveService {
  constructor(private readonly http: HttpClient) { }

  public logOut(): Observable<any> {
    return this.http.get('auth/logout?noredirect=true');
  }

  public heartBeat(): Observable<any> {
    return this.http.get('auth/keepalive');
  }
}
