import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';

// Node unit tests must not initialise the production telemetry client from api/.env.defaults.
process.env.FEATURE_APP_INSIGHTS_ENABLED = 'false';

declare global {
  // Sinon-Chai 3 exposes its assertions through Chai's global namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Chai {
    interface Assertion {
      called: Assertion;
      calledOnce: Assertion;
      calledTwice: Assertion;
      callCount(count: number): Assertion;
      calledWith(...arguments_: unknown[]): Assertion;
      calledWithExactly(...arguments_: unknown[]): Assertion;
      calledWithMatch(...arguments_: unknown[]): Assertion;
    }
  }
}

chai.use(sinonChai);

export { expect } from 'chai';
