import { of } from 'rxjs';
import { initApplication } from './app-initilizer';

describe('initApplication', () => {
  const serviceSpy = jasmine.createSpyObj('envservice', ['getEnv$']);
  const storeSpy = jasmine.createSpyObj('store', ['dispatch', 'pipe']);

  it('initApplication', () => {
    serviceSpy.getEnv$.and.returnValue(of(true));
    const returnValue: VoidFunction = initApplication(storeSpy, serviceSpy);
    expect(returnValue).toEqual(jasmine.any(Function));
    returnValue();
    expect(serviceSpy.getEnv$).toHaveBeenCalled();
  });
});
