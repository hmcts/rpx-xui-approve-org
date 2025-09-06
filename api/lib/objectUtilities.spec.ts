import { expect } from '../test/shared/testSetup';
import 'mocha';
import { propsExist } from './objectUtilities';

describe('lib/objectUtilities', () => {
  describe('propsExist', () => {
    it('should return true when all nested properties exist', () => {
      const obj = {
        level1: {
          level2: {
            level3: 'value'
          }
        }
      };
      
      const result = propsExist(obj, ['level1', 'level2', 'level3']);
      expect(result).to.be.true;
    });

    it('should return false when a nested property does not exist', () => {
      const obj = {
        level1: {
          level2: {}
        }
      };
      
      const result = propsExist(obj, ['level1', 'level2', 'level3']);
      expect(result).to.be.false;
    });

    it('should return false when an intermediate property does not exist', () => {
      const obj = {
        level1: {}
      };
      
      const result = propsExist(obj, ['level1', 'level2', 'level3']);
      expect(result).to.be.false;
    });

    it('should return true for single level property that exists', () => {
      const obj = {
        singleProp: 'value'
      };
      
      const result = propsExist(obj, ['singleProp']);
      expect(result).to.be.true;
    });

    it('should return false for single level property that does not exist', () => {
      const obj = {
        existingProp: 'value'
      };
      
      const result = propsExist(obj, ['nonExistentProp']);
      expect(result).to.be.false;
    });

    it('should return false when object is null', () => {
      const result = propsExist(null, ['anyProp']);
      expect(result).to.be.false;
    });

    it('should return false when object is undefined', () => {
      const result = propsExist(undefined, ['anyProp']);
      expect(result).to.be.false;
    });

    it('should return true for empty property array', () => {
      const obj = { prop: 'value' };
      const result = propsExist(obj, []);
      expect(result).to.be.true;
    });

    it('should handle properties with falsy values', () => {
      const obj = {
        level1: {
          falsyValue: false,
          zeroValue: 0,
          emptyString: ''
        }
      };
      
      expect(propsExist(obj, ['level1', 'falsyValue'])).to.be.true;
      expect(propsExist(obj, ['level1', 'zeroValue'])).to.be.true;
      expect(propsExist(obj, ['level1', 'emptyString'])).to.be.true;
    });

    it('should return false when property exists but is null', () => {
      const obj = {
        level1: {
          nullProp: null
        }
      };
      
      const result = propsExist(obj, ['level1', 'nullProp', 'deeperProp']);
      expect(result).to.be.false;
    });
  });
});