import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class CaseWorkerRefDataService {
    public static url = '/api/caseworkerdetails';
    constructor(private readonly http: HttpClient) { }
    public postFile(formData: FormData): Observable<any> {
        return this.http.post(CaseWorkerRefDataService.url, formData)
    }
}
