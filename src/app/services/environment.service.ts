import { Injectable, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { EnvironmentConfig, ENVIRONMENT_CONFIG } from 'src/models/environmentConfig.model';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private data: EnvironmentConfig;

  private readonly config$: Observable<EnvironmentConfig>;

  constructor(@Inject(ENVIRONMENT_CONFIG) config: EnvironmentConfig) {
    this.data = config;
    this.config$ = of(config).pipe(shareReplay(1));
  }

  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.data[key];
  }

  public getEnv$(): Observable<EnvironmentConfig> {
    return this.config$;
  }
}
