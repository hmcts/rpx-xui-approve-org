import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class PbaAccountDetails {
  private updatePbaUrl = environment.updatePbaUrl;
  constructor(private http: HttpClient) {
  }

  getAccountDetails(body): Observable<any> {
    return this.http.get<any>(this.updatePbaUrl, body);
  }


}
