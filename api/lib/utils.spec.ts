import { expect } from '../test/shared/testSetup';
import 'mocha';
import { containsDangerousCode, objectContainsOnlySafeCharacters } from './util';

describe('lib/util', () => {
  describe('containsDangerousCode', () => {
    [
      '<script>alert("bad")</script>',
      'javascript:alert("bad")',
      '<img src="x" onerror="alert(1)">',
      'eval(alert("bad"))',
      'new Function("alert(1)")',
      'document.cookie',
      '<iframe src="https://example.com"></iframe>',
      '<style>body { display: none; }</style>',
      'width: expression(alert(1))',
      'background-image: url(javascript:alert(1))',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox("bad")',
      'https://example.com/users?callback=steal',
      'https://example.com/users?jsonp=steal'
    ].forEach((input) => {
      it(`should return true for dangerous input: ${input}`, () => {
        expect(containsDangerousCode(input)).to.be.true;
      });
    });

    [
      '',
      'Organisation Name Ltd',
      'user.name@example.com',
      'https://example.com/path?query=value',
      'Suite 10, Example House, London',
      'Notes with punctuation: commas, full stops, brackets (safe).'
    ].forEach((input) => {
      it(`should return false for safe input: ${input}`, () => {
        expect(containsDangerousCode(input)).to.be.false;
      });
    });
  });

  describe('objectContainsOnlySafeCharacters', () => {
    it('should return true when all string values are safe', () => {
      const input = {
        address: {
          line1: 'Example House',
          postcode: 'SW1A 1AA'
        },
        email: 'contact@example.com',
        organisationName: 'Example Organisation Ltd'
      };

      expect(objectContainsOnlySafeCharacters(input)).to.be.true;
    });

    it('should return true for safe strings inside arrays and nested objects', () => {
      const input = {
        contacts: [
          {
            email: 'first@example.com',
            name: 'First User'
          },
          {
            email: 'second@example.com',
            name: 'Second User'
          }
        ],
        tags: ['approved', 'pending review']
      };

      expect(objectContainsOnlySafeCharacters(input)).to.be.true;
    });

    it('should ignore non-string primitive values', () => {
      const input = {
        active: true,
        count: 3,
        empty: null
      };

      expect(objectContainsOnlySafeCharacters(input)).to.be.true;
    });

    it('should return false when a top-level string contains dangerous code', () => {
      const input = {
        organisationName: '<script>alert("bad")</script>'
      };

      expect(objectContainsOnlySafeCharacters(input)).to.be.false;
    });

    it('should return false when a nested object contains dangerous code', () => {
      const input = {
        address: {
          line1: 'Example House',
          line2: 'javascript:alert("bad")'
        }
      };

      expect(objectContainsOnlySafeCharacters(input)).to.be.false;
    });

    it('should return false when an array contains dangerous code', () => {
      const input = {
        notes: ['safe note', 'document.cookie']
      };

      expect(objectContainsOnlySafeCharacters(input)).to.be.false;
    });

    it('should return false when an object inside an array contains dangerous code', () => {
      const input = {
        contacts: [
          {
            email: 'safe@example.com',
            name: 'Safe User'
          },
          {
            email: 'bad@example.com',
            name: '<img src="x" onerror="alert(1)">'
          }
        ]
      };

      expect(objectContainsOnlySafeCharacters(input)).to.be.false;
    });
  });
});
