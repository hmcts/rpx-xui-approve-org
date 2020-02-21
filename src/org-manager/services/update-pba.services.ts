import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class UpdatePbaServices {
  public updatePbaUrl = environment.updatePbaUrl;
  constructor(private readonly http: HttpClient) {
  }

  public updatePba(body): Observable<{pba1: string; pba2: string; orgId: string}> {
    return this.http.put<{pba1: string; pba2: string; orgId: string}>(this.updatePbaUrl, body);
  }

}
