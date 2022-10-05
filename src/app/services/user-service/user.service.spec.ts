import { of } from 'rxjs';
import { UserService } from './user.service';

describe('User service', () => {
    let mockedHttpClient: any;
    let service: UserService;

    beforeEach(() => {
        mockedHttpClient = jasmine.createSpyObj('mockedHttpClient', {get: of({key: 'Some Value'})});
        service = new UserService(mockedHttpClient);
    });

    describe('getUserDetails()', () => {
        it('should call auth redirect', () => {
            service.getUserDetails();

            expect(mockedHttpClient.get).toHaveBeenCalledWith(`/api/user/details`);
        });
    });
});
