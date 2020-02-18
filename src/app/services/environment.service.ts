import { Inject, Injectable } from '@angular/core';
import { EnvironmentConfig, ENVIRONMENT_CONFIG } from 'src/models/environmentConfig.model';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  constructor(@Inject(ENVIRONMENT_CONFIG) private readonly data: EnvironmentConfig) { }

  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.data[key];
  }
}
