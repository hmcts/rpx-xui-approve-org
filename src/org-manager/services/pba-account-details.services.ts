import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class PbaAccountDetails {
  public updatePbaUrl = environment.pbaAccUrl;
  constructor(private readonly http: HttpClient) {
  }

  public getAccountDetails(pbas): Observable<any> {
    return this.http.get<any>(`${this.updatePbaUrl}/?accountNames=${pbas}`);
  }

}
