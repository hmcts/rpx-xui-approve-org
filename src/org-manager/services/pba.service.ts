import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class PbaService {
  private readonly pbaUrl: string;

  constructor(private readonly http: HttpClient) {
    this.pbaUrl = environment.pbaUrl;
  }

  public getPBAsByStatus(status: string): Observable<any> {
    return this.http.get(`${this.pbaUrl}/status/${status}`);
  }

  public setPBAStatus(body: any): Observable<any> {
    return this.http.put<any>(`${this.pbaUrl}/status`, body);
  }

}
