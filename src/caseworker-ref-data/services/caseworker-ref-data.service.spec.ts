import { HttpClient } from '@angular/common/http';
import { CaseWorkerRefDataService } from './caseworker-ref-data.service';

describe('CaseWorkerRefDataService', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = jasmine.createSpyObj<HttpClient>('httpClient', ['get', 'post', 'put', 'delete']);
  });

  it('should be created and truthy', () => {
    const service = new CaseWorkerRefDataService(httpClient);
    expect(service).toBeTruthy();
  });


  it('should post data to the caseworkerdetails url', () => {
    const service = new CaseWorkerRefDataService(httpClient);

    const formData = new FormData();
    service.postFile(formData)

    expect(httpClient.post).toHaveBeenCalledWith(CaseWorkerRefDataService.url, formData);
  });
});
