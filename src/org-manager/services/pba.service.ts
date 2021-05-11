import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable()
export class PbaService {
  private readonly pbaStatusUrl: string;

  constructor(private readonly http: HttpClient) {
    this.pbaStatusUrl = `${environment.pbaUrl}/status`;
  }

  public getPBAsByStatus(status: string): Observable<any> {
    return this.http.get(`${this.pbaStatusUrl}/${status}`);
  }

  public setPBAStatus(body: any): Observable<any> {
    return this.http.put<any>(`${this.pbaStatusUrl}`, body);
  }

}
