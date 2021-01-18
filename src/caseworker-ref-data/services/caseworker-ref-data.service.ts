import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CaseWorkerRefDataUploadResponse } from '../models/caseworker-ref-data.model';

@Injectable()
export class CaseWorkerRefDataService {
    public static url = '/api/caseworkerdetails';
    constructor(private readonly http: HttpClient) { }
    public postFile(formData: FormData): Observable<any> {
        return this.http.post<CaseWorkerRefDataUploadResponse>(CaseWorkerRefDataService.url, formData);
    }
}
