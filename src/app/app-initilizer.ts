import { EnvironmentService } from './services/environment.service';

export function initApplication(environmentService: EnvironmentService): VoidFunction {
    return () => new Promise(resolve => {
        environmentService.getEnv$().subscribe(() => {
            resolve(true);
        });
    });
}
