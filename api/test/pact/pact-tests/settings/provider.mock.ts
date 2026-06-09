import { PactV2 as Pact } from '@pact-foundation/pact';
import * as path from 'path';

export interface PactTestSetupConfig {
  provider: string;
  port: number;
}

export class PactTestSetup {
  provider: Pact;
  port: number;

  constructor(config: PactTestSetupConfig) {
    this.port = config.port;
    this.provider = new Pact({
      consumer: 'xui_approveorg',
      dir: path.resolve(process.cwd(), 'api/test/pact/pacts'),
      log: path.resolve(process.cwd(), 'api/test/pact/logs', 'mockserver-integration.log'),
      pactfileWriteMode: 'merge',
      port: this.port,
      provider: config.provider,
      spec: 2
    });
  }

  async verifyAndFinalize(): Promise<void> {
    try {
      await this.provider.verify();
    } finally {
      await this.provider.finalize();
    }
  }
}
