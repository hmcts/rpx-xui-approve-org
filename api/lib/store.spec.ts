import { expect } from '../test/shared/testSetup';
import 'mocha';
import { Store } from './store';

describe('lib/store', () => {
  describe('Store class', () => {
    let mockRequest: any;
    let store: Store;

    beforeEach(() => {
      mockRequest = {
        session: {}
      };
      store = new Store(mockRequest);
    });

    describe('constructor', () => {
      it('should initialize with request session', () => {
        expect(store.session).to.equal(mockRequest.session);
      });

      it('should handle request with existing session data', () => {
        const requestWithData = {
          session: {
            existingKey: 'existingValue',
            userId: 123
          }
        };
        
        const storeWithData = new Store(requestWithData);
        expect(storeWithData.session).to.equal(requestWithData.session);
        expect(storeWithData.session.existingKey).to.equal('existingValue');
      });
    });

    describe('set method', () => {
      it('should set value in session', async () => {
        await store.set('testKey', 'testValue');
        
        expect(store.session.testKey).to.equal('testValue');
      });

      it('should overwrite existing value', async () => {
        await store.set('key', 'initialValue');
        await store.set('key', 'newValue');
        
        expect(store.session.key).to.equal('newValue');
      });

      it('should handle different data types', async () => {
        await store.set('stringKey', 'stringValue');
        await store.set('numberKey', 42);
        await store.set('booleanKey', true);
        await store.set('objectKey', { nested: 'object' });
        await store.set('arrayKey', [1, 2, 3]);
        
        expect(store.session.stringKey).to.equal('stringValue');
        expect(store.session.numberKey).to.equal(42);
        expect(store.session.booleanKey).to.be.true;
        expect(store.session.objectKey).to.deep.equal({ nested: 'object' });
        expect(store.session.arrayKey).to.deep.equal([1, 2, 3]);
      });

      it('should handle null and undefined values', async () => {
        await store.set('nullKey', null);
        await store.set('undefinedKey', undefined);
        
        expect(store.session.nullKey).to.be.null;
        expect(store.session.undefinedKey).to.be.undefined;
      });
    });

    describe('get method', () => {
      it('should retrieve value from session', async () => {
        store.session.testKey = 'testValue';
        
        const result = await store.get('testKey');
        expect(result).to.equal('testValue');
      });

      it('should return undefined for non-existent key', async () => {
        const result = await store.get('nonExistentKey');
        expect(result).to.be.undefined;
      });

      it('should retrieve different data types correctly', async () => {
        store.session.string = 'value';
        store.session.number = 123;
        store.session.boolean = false;
        store.session.object = { key: 'value' };
        store.session.array = ['a', 'b', 'c'];
        
        expect(await store.get('string')).to.equal('value');
        expect(await store.get('number')).to.equal(123);
        expect(await store.get('boolean')).to.be.false;
        expect(await store.get('object')).to.deep.equal({ key: 'value' });
        expect(await store.get('array')).to.deep.equal(['a', 'b', 'c']);
      });

      it('should handle null and undefined stored values', async () => {
        store.session.nullValue = null;
        store.session.undefinedValue = undefined;
        
        expect(await store.get('nullValue')).to.be.null;
        expect(await store.get('undefinedValue')).to.be.undefined;
      });
    });

    describe('integration between set and get', () => {
      it('should set and get values correctly', async () => {
        await store.set('integrationKey', 'integrationValue');
        const result = await store.get('integrationKey');
        
        expect(result).to.equal('integrationValue');
      });

      it('should maintain multiple key-value pairs', async () => {
        await store.set('key1', 'value1');
        await store.set('key2', 'value2');
        await store.set('key3', 'value3');
        
        expect(await store.get('key1')).to.equal('value1');
        expect(await store.get('key2')).to.equal('value2');
        expect(await store.get('key3')).to.equal('value3');
      });

      it('should handle session modifications outside of store', async () => {
        await store.set('storeKey', 'storeValue');
        
        store.session.directKey = 'directValue';
        
        expect(await store.get('storeKey')).to.equal('storeValue');
        expect(await store.get('directKey')).to.equal('directValue');
      });
    });
  });
});