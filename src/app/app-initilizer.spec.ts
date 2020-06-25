import { of } from 'rxjs';
import {initApplication} from './app-initilizer';

describe('initApplication', () => {
    const serviceSpy = jasmine.createSpyObj('envservice', ['getEnv$']);
    it('initApplication', () => {
        serviceSpy.getEnv$.and.returnValue(of(true));
        const returnValue: VoidFunction = initApplication(serviceSpy);
        expect(returnValue).toEqual(jasmine.any(Function));
        returnValue();
        expect(serviceSpy.getEnv$).toHaveBeenCalled();
    });
});
