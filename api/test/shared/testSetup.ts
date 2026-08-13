import * as chai from 'chai';
import type {} from 'sinon-chai';

const sinonChai = require('sinon-chai') as Chai.ChaiPlugin;

chai.use(sinonChai);

export { expect } from 'chai';
