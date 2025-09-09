import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { handleCondition, handleState, handleInstruction, getRegister, process } from './stateEngine';
import * as stack from './stack';

describe('lib/stateEngine', () => {
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub()
    };

    sinon.stub(require('./log4jui'), 'getLogger').returns(mockLogger);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('handleCondition', () => {
    it('should return result when condition matches', () => {
      const conditionNode = {
        condition: [{ status: 'approved' }],
        result: 'success'
      };
      const variables = { status: 'approved', userId: 123 };

      const result = handleCondition(conditionNode, variables);

      expect(result).to.equal('success');
    });

    it('should return null when condition does not match', () => {
      const conditionNode = {
        condition: [{ status: 'approved' }],
        result: 'success'
      };
      const variables = { status: 'rejected', userId: 123 };

      const result = handleCondition(conditionNode, variables);

      expect(result).to.be.null;
    });

    it('should handle numeric condition values', () => {
      const conditionNode = {
        condition: [{ count: 5 }],
        result: 'threshold_reached'
      };
      const variables = { count: 5, status: 'active' };

      const result = handleCondition(conditionNode, variables);

      expect(result).to.equal('threshold_reached');
    });

    it('should handle boolean condition values', () => {
      const conditionNode = {
        condition: [{ isActive: true }],
        result: 'activated'
      };
      const variables = { isActive: true, userId: 'user123' };

      const result = handleCondition(conditionNode, variables);

      expect(result).to.equal('activated');
    });

    it('should return null when variable is undefined', () => {
      const conditionNode = {
        condition: [{ missingKey: 'value' }],
        result: 'success'
      };
      const variables = { status: 'approved' };

      const result = handleCondition(conditionNode, variables);

      expect(result).to.be.null;
    });

    it('should handle string condition matching', () => {
      const conditionNode = {
        condition: [{ role: 'admin' }],
        result: 'admin_access'
      };
      const variables = { role: 'admin', department: 'IT' };

      const result = handleCondition(conditionNode, variables);

      expect(result).to.equal('admin_access');
    });

    it('should return null for partial string match', () => {
      const conditionNode = {
        condition: [{ role: 'admin' }],
        result: 'admin_access'
      };
      const variables = { role: 'administrator', department: 'IT' };

      const result = handleCondition(conditionNode, variables);

      expect(result).to.be.null;
    });

    it('should handle null condition values', () => {
      const conditionNode = {
        condition: [{ value: null }],
        result: 'null_match'
      };
      const variables = { value: null, other: 'test' };

      const result = handleCondition(conditionNode, variables);

      expect(result).to.equal('null_match');
    });
  });

  describe('handleState', () => {
    it('should handle single condition node', () => {
      const stateNode = {
        state: 'review',
        condition: [{ status: 'pending' }],
        result: 'needs_review'
      };
      const variables = { status: 'pending' };

      const result = handleState(stateNode, variables);

      expect(result).to.equal('needs_review');
    });

    it('should handle multiple conditions node', () => {
      const stateNode = {
        state: 'approval',
        conditions: [
          { condition: [{ role: 'admin' }], result: 'auto_approve' },
          { condition: [{ role: 'manager' }], result: 'manager_review' }
        ]
      };
      const variables = { role: 'admin' };

      // Mock the 'some' utility function
      const someStub = sinon.stub(require('./util'), 'some');
      someStub.callsFake((array: any[], predicate: any) => {
        for (const item of array) {
          const result = predicate(item);
          if (result) {
            return result;
          }
        }
        return false;
      });

      const result = handleState(stateNode, variables);

      expect(result).to.equal('auto_approve');
    });

    it('should handle state node with direct result', () => {
      const stateNode = {
        state: 'completed',
        result: 'task_done'
      };
      const variables = {};

      const result = handleState(stateNode, variables);

      expect(result).to.equal('task_done');
    });

    it('should return null when no conditions match and no direct result', () => {
      const stateNode = {
        state: 'unknown'
      };
      const variables = {};

      const result = handleState(stateNode, variables);

      expect(result).to.be.null;
    });

    it('should handle conditions array with no matches', () => {
      const stateNode = {
        state: 'processing',
        conditions: [
          { condition: [{ status: 'approved' }], result: 'process' },
          { condition: [{ status: 'verified' }], result: 'validate' }
        ]
      };
      const variables = { status: 'pending' };

      const someStub = sinon.stub(require('./util'), 'some');
      someStub.returns(false);

      const result = handleState(stateNode, variables);

      expect(result).to.be.false;
    });
  });

  describe('handleInstruction', () => {
    it('should handle instruction with single state', () => {
      const instruction = {
        event: 'submit',
        state: 'draft',
        condition: [{ ready: true }],
        result: 'submitted'
      };
      const variables = { ready: true };

      const result = handleInstruction(instruction, 'draft', variables);

      expect(result).to.equal('submitted');
    });

    it('should handle instruction with multiple states', () => {
      const instruction = {
        event: 'approve',
        states: [
          { state: 'pending', condition: [{ role: 'admin' }], result: 'approved' },
          { state: 'review', condition: [{ role: 'reviewer' }], result: 'reviewed' }
        ]
      };
      const variables = { role: 'admin' };

      const someStub = sinon.stub(require('./util'), 'some');
      someStub.callsFake((array: any[], predicate: any) => {
        for (const item of array) {
          const result = predicate(item);
          if (result) {
            return result;
          }
        }
        return false;
      });

      const result = handleInstruction(instruction, 'pending', variables);

      expect(result).to.equal('approved');
    });

    it('should return instruction result when no state matches', () => {
      const instruction = {
        event: 'default',
        result: 'default_action'
      };
      const variables = {};

      const result = handleInstruction(instruction, 'any_state', variables);

      expect(result).to.equal('default_action');
    });

    it('should handle instruction with state that does not match stateId', () => {
      const instruction = {
        event: 'action',
        state: 'active',
        result: 'activated'
      };
      const variables = {};

      const result = handleInstruction(instruction, 'inactive', variables);

      expect(result).to.equal('activated');
    });

    it('should handle multiple states where target state is not found', () => {
      const instruction = {
        event: 'process',
        states: [
          { state: 'state1', result: 'result1' },
          { state: 'state2', result: 'result2' }
        ]
      };
      const variables = {};

      const someStub = sinon.stub(require('./util'), 'some');
      someStub.returns(false);

      const result = handleInstruction(instruction, 'state3', variables);

      expect(result).to.be.false;
    });

    it('should handle complex nested state matching', () => {
      const instruction = {
        event: 'validate',
        states: [
          {
            state: 'form',
            conditions: [
              { condition: [{ valid: true }], result: 'form_valid' }
            ]
          }
        ]
      };
      const variables = { valid: true };

      const someStub = sinon.stub(require('./util'), 'some');
      someStub.callsFake((array: any[], predicate: any) => {
        for (const item of array) {
          const result = predicate(item);
          if (result) {
            return result;
          }
        }
        return false;
      });

      const result = handleInstruction(instruction, 'form', variables);

      expect(result).to.equal('form_valid');
    });
  });

  describe('getRegister', () => {
    it('should filter and return only register instructions', () => {
      const mapping = [
        { event: 'event1', result: 'result1' },
        { event: 'event2', register: ['step1', 'step2'] },
        { event: 'event3', result: 'result3' },
        { event: 'event4', register: ['step3', 'step4'] }
      ];

      const result = getRegister(mapping);

      expect(result).to.have.length(2);
      expect(result[0].register).to.deep.equal(['step1', 'step2']);
      expect(result[1].register).to.deep.equal(['step3', 'step4']);
    });

    it('should return empty array when no register instructions exist', () => {
      const mapping = [
        { event: 'event1', result: 'result1' },
        { event: 'event2', result: 'result2' }
      ];

      const result = getRegister(mapping);

      expect(result).to.have.length(0);
    });

    it('should handle empty mapping array', () => {
      const mapping = [];

      const result = getRegister(mapping);

      expect(result).to.have.length(0);
    });

    it('should handle mapping with mixed register types', () => {
      const mapping = [
        { event: 'event1', register: 'single_register' },
        { event: 'event2', register: ['multi', 'register'] },
        { event: 'event3', result: 'no_register' }
      ];

      const result = getRegister(mapping);

      expect(result).to.have.length(2);
      expect(result[0].register).to.equal('single_register');
      expect(result[1].register).to.deep.equal(['multi', 'register']);
    });
  });

  describe('process', () => {
    let mockReq: any;
    let mockRes: any;
    let mockStore: any;
    let mapping: any;
    let templates: any;
    let payload: any;
    let stackStubs: any;

    beforeEach(() => {
      mockReq = {
        params: {
          jurId: 'TEST_JURISDICTION',
          caseId: 'CASE_123',
          caseTypeId: 'TestCaseType',
          stateId: 'currentState'
        },
        body: {
          event: 'testEvent',
          formValues: { field1: 'value1', field2: 'value2' }
        },
        method: 'POST',
        session: {
          save: sinon.stub().callsArg(0)
        }
      };

      mockRes = {
        send: sinon.stub()
      };

      mockStore = {
        get: sinon.stub().resolves({ existingField: 'existingValue' }),
        set: sinon.stub().resolves(true)
      };

      mapping = [
        {
          event: 'testEvent',
          state: 'currentState',
          result: 'nextState'
        },
        {
          register: ['register1', 'register2']
        }
      ];

      templates = {
        testcasetype: {
          nextState: { title: 'Next State', fields: [] },
          currentState: { title: 'Current State', fields: [] },
          conditionalResult: { title: 'Conditional Result', fields: [] }
        },
        uppercase_case_type: {
          nextState: { title: 'Next State', fields: [] },
          currentState: { title: 'Current State', fields: [] }
        }
      };

      payload = sinon.stub().resolves({ data: 'payloadResult' });

      stackStubs = {
        pushStack: sinon.stub(stack, 'pushStack').resolves(),
        shiftStack: sinon.stub(stack, 'shiftStack').resolves('stackResult'),
        forwardStack: sinon.stub(stack, 'forwardStack').returns(['forward1', 'forward2']),
        stackEmpty: sinon.stub(stack, 'stackEmpty').resolves(false)
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should process POST request with form values and merge with stored data', async () => {
      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(mockStore.get).to.have.been.calledWith('decisions_TEST_JURISDICTION_testcasetype_CASE_123');
      expect(mockStore.set).to.have.been.calledWith(
        'decisions_TEST_JURISDICTION_testcasetype_CASE_123',
        { existingField: 'existingValue', field1: 'value1', field2: 'value2' }
      );
      expect(mockRes.send).to.have.been.called;
    });

    it('should handle POST request without body', async () => {
      delete mockReq.body;

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(mockReq.body).to.deep.equal({});
      expect(mockRes.send).to.have.been.called;
    });

    it('should handle POST request without form values', async () => {
      delete mockReq.body.formValues;

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(mockStore.get).to.have.been.called;
      expect(mockStore.set).not.to.have.been.called;
      expect(mockRes.send).to.have.been.called;
    });

    it('should handle empty stored data', async () => {
      mockStore.get.resolves('');

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(mockStore.set).to.have.been.calledWith(
        'decisions_TEST_JURISDICTION_testcasetype_CASE_123',
        { field1: 'value1', field2: 'value2' }
      );
    });

    it('should handle <register> result', async () => {
      mapping[0].result = '<register>';

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(stackStubs.pushStack).to.have.been.calledWith(mockReq, ['register1', 'register2']);
      expect(stackStubs.shiftStack).to.have.been.called;
      expect(stackStubs.pushStack).to.have.been.called;
      expect(stackStubs.shiftStack).to.have.been.called;
    });

    it('should handle ... result with empty stack', async () => {
      mapping[0].result = '...';
      stackStubs.stackEmpty.resolves(true);

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(stackStubs.forwardStack).to.have.been.calledWith(['register1', 'register2'], 'currentState');
      expect(stackStubs.pushStack).to.have.been.called;
      expect(stackStubs.shiftStack).to.have.been.called;
    });

    it('should handle ... result with non-empty stack', async () => {
      mapping[0].result = '...';
      stackStubs.stackEmpty.resolves(false);

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(stackStubs.shiftStack).to.have.been.called;
      expect(stackStubs.forwardStack).not.to.have.been.called;
    });

    it('should handle [state] result', async () => {
      mapping[0].result = '[state]';

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(mockRes.send).to.have.been.calledWith(sinon.match(/"newRoute":"currentState"/));
    });

    it('should handle . result with successful payload', async () => {
      mapping[0].result = '.';
      payload.resolves({ success: true });

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(payload).to.have.been.calledWith(mockReq, mockRes, sinon.match.object);
      expect(mockRes.send).to.have.been.called;
    });

    it('should return early when . result payload fails', async () => {
      mapping[0].result = '.';
      payload.resolves(null);

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(payload).to.have.been.called;
      expect(mockRes.send).not.to.have.been.called;
    });

    it('should handle GET request', async () => {
      mockReq.method = 'GET';

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(mockRes.send).to.have.been.called;
      expect(mockStore.get).to.have.been.called; // Called at the end to get final variables
    });

    it('should handle GET request with reset state', async () => {
      mockReq.method = 'GET';
      mockReq.params.stateId = 'reset';

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(mockStore.set).to.have.been.calledWith('decisions_TEST_JURISDICTION_testcasetype_CASE_123', {});
      expect(mockRes.send).not.to.have.been.called;
    });

    it('should handle no matching event in mapping', async () => {
      mockReq.body.event = 'nonExistentEvent';

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(mockRes.send).to.have.been.called;
    });

    it('should handle case type ID conversion to lowercase', async () => {
      mockReq.params.caseTypeId = 'UPPERCASE_CASE_TYPE';

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(mockStore.get).to.have.been.calledWith('decisions_TEST_JURISDICTION_uppercase_case_type_CASE_123');
    });

    it('should handle final response with proper structure', async () => {
      mockStore.get.onCall(1).resolves({ finalField: 'finalValue' }); // Second call for final variables

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      const responseCall = mockRes.send.getCall(0);
      const response = JSON.parse(responseCall.args[0]);

      expect(response).to.have.property('formValues');
      expect(response).to.have.property('meta');
      expect(response).to.have.property('newRoute');
      expect(response.newRoute).to.equal('nextState');
    });

    it('should handle null stored variables at end', async () => {
      mockStore.get.onCall(1).resolves(null); // Second call returns null

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      const responseCall = mockRes.send.getCall(0);
      const response = JSON.parse(responseCall.args[0]);

      expect(response.formValues).to.deep.equal({});
    });

    it('should handle complex event mapping with conditions', async () => {
      mapping[0] = {
        event: 'testEvent',
        states: [
          { state: 'currentState', condition: [{ field1: 'value1' }], result: 'conditionalResult' }
        ]
      };

      await process(mockReq, mockRes, mapping, payload, templates, mockStore);

      expect(mockRes.send).to.have.been.called;
      const responseCall = mockRes.send.getCall(0);
      const response = JSON.parse(responseCall.args[0]);
      expect(response).to.have.property('newRoute', 'conditionalResult');
    });
  });
});
