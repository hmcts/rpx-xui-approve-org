import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const requireConfig = createRequire(__filename);

function loadFunctionalOutputDirs(): string[] {
  const originalEnv = { ...process.env };
  process.env.PW_SKIP_SESSION_CAPTURE = 'true';

  try {
    return [
      requireConfig('../../playwright.config.ts').outputDir,
      requireConfig('../../playwright-api.config.ts').outputDir,
      requireConfig('../../playwright-integration.config.ts').outputDir,
      requireConfig('../../playwright-nightly.config.ts').outputDir,
      requireConfig('../../playwright-accessibility.config.ts').outputDir
    ];
  } finally {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, originalEnv);
  }
}

function isSameOrParent(parent: string, child: string): boolean {
  const relativePath = path.relative(parent, child);
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

test.describe('Playwright functional output isolation', () => {
  test('uses a distinct output directory for each functional suite', () => {
    const outputDirs = loadFunctionalOutputDirs().map((outputDir) => path.normalize(outputDir));

    expect(outputDirs).toHaveLength(new Set(outputDirs).size);
    for (const outputDir of outputDirs) {
      expect(outputDir).toMatch(/^functional-output\/tests\/playwright-[^/]+\/test-results$/);
    }

    for (const left of outputDirs) {
      for (const right of outputDirs) {
        if (left !== right) {
          expect(isSameOrParent(left, right)).toBe(false);
        }
      }
    }
  });

  test('api cleanup does not delete in-flight integration artifacts', () => {
    const tempParent = path.resolve(__dirname, '../../functional-output/tmp');
    mkdirSync(tempParent, { recursive: true });
    const tempRoot = mkdtempSync(path.join(tempParent, 'playwright-output-isolation-'));
    const integrationTrace = path.join(tempRoot, 'playwright-integration', 'test-results', 'trace.zip');
    const apiTest = path.join(tempRoot, 'api.spec.ts');
    const apiConfig = path.join(tempRoot, 'playwright.config.ts');

    mkdirSync(path.dirname(integrationTrace), { recursive: true });
    writeFileSync(apiTest, 'import { test } from \'@playwright/test\';\ntest(\'api placeholder\', async () => {});\n');
    writeFileSync(apiConfig, `
      import { defineConfig } from '@playwright/test';
      export default defineConfig({
        testDir: ${JSON.stringify(tempRoot)},
        testMatch: /.*\\.spec\\.ts/,
        outputDir: ${JSON.stringify(path.join(tempRoot, 'playwright-api', 'test-results'))},
        reporter: 'list'
      });
    `);
    writeFileSync(integrationTrace, 'trace', { flag: 'w' });

    try {
      execFileSync(
        'npx',
        [
          'playwright',
          'test',
          apiTest,
          `--config=${apiConfig}`
        ],
        {
          cwd: path.resolve(__dirname, '../..'),
          env: {
            ...process.env,
            PLAYWRIGHT_DEFAULT_REPORTER: 'list',
            PW_SKIP_SESSION_CAPTURE: 'true'
          },
          stdio: 'pipe'
        }
      );

      expect(() => rmSync(integrationTrace)).not.toThrow();
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
