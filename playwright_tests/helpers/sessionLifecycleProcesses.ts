import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';

export type OwnedLifecycleProcess = { pid: number; title: string; group?: boolean };

export function lifecycleProcessRegistration(ownerFile: string, titlePrefix: string): string {
  return `
if (process.argv[1] && process.argv[1].endsWith('/session-capture-child.cjs')) {
  process.title = ${JSON.stringify(titlePrefix)} + '-owner-' + process.pid;
  require('node:fs').appendFileSync(${JSON.stringify(ownerFile)}, JSON.stringify({ pid: process.pid, title: process.title, group: true }) + '\\n');
}
if (process.argv[1] && process.argv[1].endsWith('/cli.js')) process.title = ${JSON.stringify(titlePrefix)} + '-runner-' + process.pid;
`;
}

function isRunning(owner: OwnedLifecycleProcess, awaitingExit = false): boolean {
  if (!Number.isInteger(owner.pid) || owner.pid <= 0 || !/^ao-session-[a-z0-9-]+$/i.test(owner.title)) {
    throw new Error('Invalid test process identity; refusing cleanup.');
  }
  const result = spawnSync('/bin/ps', ['-p', String(owner.pid), '-o', 'stat=', '-o', 'command='], {
    encoding: 'utf8', timeout: 500, stdio: ['ignore', 'pipe', 'ignore']
  });
  if (!result.error && result.status === 1 && !result.stdout.trim()) {
    return false;
  }
  const observed = result.stdout.trim().match(/^(\S+)\s+(.+)$/);
  if (!result.error && result.status === 0 && observed?.[1].startsWith('Z')) {
    return false;
  }
  if (awaitingExit && !result.error && result.status === 0 && observed?.[2].trim() !== owner.title) {
    return true;
  }
  if (result.error || result.status !== 0 || observed?.[2].trim() !== owner.title) {
    throw new Error('Test process identity could not be confirmed; retaining fixture.');
  }
  return true;
}

async function waitForStop(owner: OwnedLifecycleProcess): Promise<boolean> {
  const deadline = Date.now() + 2_000;
  while (isRunning(owner, true)) {
    if (Date.now() >= deadline) {
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return true;
}

export async function stopLifecycleProcess(owner: OwnedLifecycleProcess): Promise<void> {
  if (!isRunning(owner)) {
    return;
  }
  try {
    process.kill(owner.group ? -owner.pid : owner.pid, 'SIGTERM');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
      throw error;
    }
  }
  if (await waitForStop(owner)) {
    return;
  }
  // Refuse escalation if the PID no longer has this run's identity.
  if (!isRunning(owner)) {
    return;
  }
  try {
    process.kill(owner.group ? -owner.pid : owner.pid, 'SIGKILL');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
      throw error;
    }
  }
  if (!(await waitForStop(owner))) {
    throw new Error('Test process did not stop; retaining fixture.');
  }
}

export async function cleanupLifecycleFixture(directory: string, owners: OwnedLifecycleProcess[]): Promise<void> {
  try {
    for (const owner of owners) {
      await stopLifecycleProcess(owner);
    }
  } catch (error) {
    throw Object.assign(new Error(`Synthetic lifecycle cleanup failed; fixture retained at ${directory}`), { cause: error });
  }
  rmSync(directory, { recursive: true, force: true });
}
