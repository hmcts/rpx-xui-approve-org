export type AuthRecoveryDriver = {
  isErrorPage(): Promise<boolean>;
  reload(): Promise<void>;
  waitFor(ms: number): Promise<void>;
  gotoRoot(): Promise<void>;
  reopenRoot(): Promise<void>;
};

export type AuthRecoveryOptions = {
  immediateRefreshAttempts: number;
  shortWaitMs: number;
};

export type AuthRecoveryHooks = {
  onImmediateRefresh?: (attempt: number) => void | Promise<void>;
  onReload?: () => void | Promise<void>;
  onGotoRoot?: () => void | Promise<void>;
  onReopenRoot?: () => void | Promise<void>;
};

export async function recoverCallbackError(
  driver: Pick<AuthRecoveryDriver, 'gotoRoot' | 'waitFor'>,
  waitMs: number,
  hooks?: Pick<AuthRecoveryHooks, 'onGotoRoot'>
) {
  await hooks?.onGotoRoot?.();
  await driver.gotoRoot();
  await driver.waitFor(waitMs);
}

export async function recoverServerError(
  driver: AuthRecoveryDriver,
  options: AuthRecoveryOptions,
  hooks?: AuthRecoveryHooks
) {
  for (let attempt = 1; attempt <= options.immediateRefreshAttempts; attempt++) {
    if (!(await driver.isErrorPage())) {
      return;
    }

    await hooks?.onImmediateRefresh?.(attempt);
    await driver.reload();
    await driver.waitFor(250);
  }

  if (!(await driver.isErrorPage())) {
    return;
  }

  await hooks?.onReload?.();
  await driver.reload();
  await driver.waitFor(options.shortWaitMs);
  if (!(await driver.isErrorPage())) {
    return;
  }

  await hooks?.onGotoRoot?.();
  await driver.gotoRoot();
  await driver.waitFor(options.shortWaitMs);
  if (!(await driver.isErrorPage())) {
    return;
  }

  await hooks?.onReopenRoot?.();
  await driver.reopenRoot();
}
