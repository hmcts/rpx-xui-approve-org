import { UsersService } from './users.service';

describe('Accept terms And Conditions Service', () => {

    it('should be created And Truthy', () => {
        const mockHttpClient = jasmine.createSpyObj('mockHttpClient', ['get', 'post']);
        const service = new UsersService(mockHttpClient);
        expect(service).toBeTruthy();
      });

    it('should getOrganisationUsers', () => {
        const mockHttpClient = jasmine.createSpyObj('mockHttpClient', ['get', 'post']);
        const service = new UsersService(mockHttpClient);
        service.getOrganisationUsers('dummy');
        expect(mockHttpClient.get).toHaveBeenCalledWith(service.orgUsersUrl + 'dummy');
    });

    it('should inviteUser', () => {
        const mockHttpClient = jasmine.createSpyObj('mockHttpClient', ['get', 'post']);
        const service = new UsersService(mockHttpClient);
        service.inviteUser('dummy', {});
        expect(mockHttpClient.post).toHaveBeenCalledWith(service.reinviteUserUrl + 'dummy', {});
    });

});
