import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { shareReplay } from 'rxjs/operators';
import { EnvironmentConfig } from 'src/models/environmentConfig.model';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  private data: EnvironmentConfig;

  config$ = this.http.get<EnvironmentConfig>('/api/environment/config').pipe( shareReplay(1) );

  constructor(private http: HttpClient) {
    this.config$.subscribe( config => {
      this.data = config;
    });
  }

  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.data[key];
  }
}


export type Test = 'testA' | 'testB';
