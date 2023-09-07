import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ConfirmNewPBAModel } from '../../models/confirm-new-pba.model';
import { SearchPBARequest } from '../../models/dtos';

@Injectable()
export class PbaService {
  private readonly pbaStatusUrl: string;

  constructor(private readonly http: HttpClient) {
    this.pbaStatusUrl = `${environment.pbaUrl}/status`;
  }

  public getPBAsByStatus(status: string): Observable<any> {
    return this.http.get(`${this.pbaStatusUrl}/${status}`);
  }

  public setPBAStatus(body: any): Observable<ConfirmNewPBAModel> {
    return this.http.put<ConfirmNewPBAModel>(`${this.pbaStatusUrl}`, body);
  }

  public searchPbasWithPagination(body: { searchRequest: SearchPBARequest, view: string }): Observable<any> {
    return this.http.post<any[]>(`${this.pbaStatusUrl}/${body.view}`, body);
  }
}
