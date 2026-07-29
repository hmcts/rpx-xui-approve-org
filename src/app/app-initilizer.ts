import { EnvironmentService } from './services/environment.service';

export function initApplication(environmentService: EnvironmentService): () => Promise<void> {
  return () => new Promise<void>((resolve) => {
    environmentService.getEnv$().subscribe(() => {
      resolve();
    });
  });
}
