import { expect } from '../test/shared/testSetup';
import 'mocha';
import { 
  ENVIRONMENT,
  COOKIE_TOKEN,
  COOKIES_USERID, 
  COOKIE_ROLES,
  MAX_LINES,
  SERVICES_ISS_PATH
} from './references';

describe('configuration/references', () => {
  describe('environment references', () => {
    it('should define ENVIRONMENT reference', () => {
      expect(ENVIRONMENT).to.equal('environment');
    });

    it('should define SERVICES_ISS_PATH reference', () => {
      expect(SERVICES_ISS_PATH).to.equal('iss');
    });
  });

  describe('cookie references', () => {
    it('should define COOKIE_TOKEN reference', () => {
      expect(COOKIE_TOKEN).to.equal('cookies.token');
    });

    it('should define COOKIES_USERID reference', () => {
      expect(COOKIES_USERID).to.equal('cookies.userId');
    });

    it('should define COOKIE_ROLES reference', () => {
      expect(COOKIE_ROLES).to.equal('cookies.roles');
    });
  });

  describe('exception references', () => {
    it('should define MAX_LINES reference', () => {
      expect(MAX_LINES).to.equal('exceptionOptions.maxLines');
    });
  });

  describe('all references should be strings', () => {
    const references = [
      ENVIRONMENT,
      SERVICES_ISS_PATH,
      COOKIE_TOKEN,
      COOKIES_USERID,
      COOKIE_ROLES,
      MAX_LINES
    ];

    references.forEach((ref, index) => {
      it(`reference ${index + 1} should be a string`, () => {
        expect(ref).to.be.a('string');
        expect(ref.length).to.be.greaterThan(0);
      });
    });
  });
});