import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserInterface } from 'src/models/user.model';
import { UserService } from './user.service';

describe('UserService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ UserService ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    userService = TestBed.inject(UserService);
  });

  it('Calls correct endpoint', () => {
    const testData: UserInterface = {
      email: 'test@test.org',
      orgId: '1234',
      roles: ['roleA', 'roleB'],
      userId: '1234'
    };

    userService.getUserDetails().subscribe(data => expect(data).toEqual(testData));

    const req = httpTestingController.expectOne('/api/user/details');
    expect(req.request.method).toEqual('GET');
    req.flush(testData);
    httpTestingController.verify();
  });
});
