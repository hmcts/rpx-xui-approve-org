import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserInterface } from '../../../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  constructor(private readonly http: HttpClient) {}
  public getUserDetails(): Observable<UserInterface> {
    return this.http.get<UserInterface>('/api/user/details');
  }
}
