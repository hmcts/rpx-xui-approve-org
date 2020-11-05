import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { EnvironmentConfig } from 'src/models/environmentConfig.model';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  private data: EnvironmentConfig;

  private readonly config$ = this.http.get<EnvironmentConfig>('/api/environment/config')
    .pipe<EnvironmentConfig>( shareReplay<EnvironmentConfig>(1) );

  constructor(private readonly http: HttpClient) {
    this.config$.subscribe( config => {
      this.data = config;
    });
  }

  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.data[key];
  }

  public getEnv$(): Observable<EnvironmentConfig> {
    return this.config$;
  }
}
