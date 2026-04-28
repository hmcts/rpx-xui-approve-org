import { cpus } from 'node:os';

type EnvMap = NodeJS.ProcessEnv;

export function resolveConfiguredWorkerCount(env: EnvMap = process.env): number | undefined {
  const configured = env.FUNCTIONAL_TESTS_WORKERS?.trim();
  if (!configured) {
    return undefined;
  }

  const parsed = Number.parseInt(configured, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function resolveWorkerTargetEnvironment(env: EnvMap = process.env): string | undefined {
  const configuredTarget = env.TEST_TYPE?.trim().toLowerCase();
  if (configuredTarget) {
    return configuredTarget;
  }

  const configuredUrl = env.TEST_URL?.trim();
  if (!configuredUrl) {
    return undefined;
  }

  try {
    const hostname = new URL(configuredUrl).hostname.toLowerCase();
    if (hostname.includes('.aat.')) {
      return 'aat';
    }
    if (hostname.includes('.demo.')) {
      return 'demo';
    }
    return hostname;
  } catch {
    return undefined;
  }
}

export function resolveWorkerCount(env: EnvMap = process.env): number {
  const configured = resolveConfiguredWorkerCount(env);
  if (configured !== undefined) {
    return configured;
  }

  if (env.CI) {
    const targetEnv = resolveWorkerTargetEnvironment(env);
    if (targetEnv === 'aat' || targetEnv === 'demo') {
      return 2;
    }
    return 8;
  }

  const logical = cpus()?.length ?? 1;
  const approxPhysical = logical <= 2 ? 1 : Math.max(1, Math.round(logical / 2));
  return Math.min(8, Math.max(2, approxPhysical));
}
