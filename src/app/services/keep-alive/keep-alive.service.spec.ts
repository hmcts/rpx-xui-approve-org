import { of } from 'rxjs';
import { LogOutKeepAliveService } from './keep-alive.service';

describe('KeepAlive service', () => {
    let mockedHttpClient: any;
    let service: LogOutKeepAliveService;

    beforeEach(() => {
        mockedHttpClient = jasmine.createSpyObj('mockedHttpClient', {get: of({key: 'Some Value'})});
        service = new LogOutKeepAliveService(mockedHttpClient);
    });

    describe('logOut()', () => {
        it('should call auth redirect', () => {
            service.logOut();

            expect(mockedHttpClient.get).toHaveBeenCalledWith('auth/logout?noredirect=true');
        });
    });

    describe('heartBeat()', () => {
        it('should call keepalive', () => {
            service.heartBeat();

            expect(mockedHttpClient.get).toHaveBeenCalledWith('auth/keepalive');
        });
    });
});
