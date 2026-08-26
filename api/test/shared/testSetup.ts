import * as chai from 'chai';
import * as sinonChaiModule from 'sinon-chai';

const sinonChai = ((sinonChaiModule as unknown as { default?: Chai.ChaiPlugin }).default || sinonChaiModule) as Chai.ChaiPlugin;

chai.use(sinonChai);

export { expect } from 'chai';
