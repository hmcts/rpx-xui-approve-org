import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class UpdatePbaServices {
  private updatePbaUrl = environment.updatePbaUrl;
  constructor(private http: HttpClient) {
  }

  updatePba(body): Observable<{pba1: string; pba2: string; orgId: string}> {
    return this.http.put<{pba1: string; pba2: string; orgId: string}>(this.updatePbaUrl, body);
  }


}
