import { of } from 'rxjs';
import { CaseWorkerRefDataService } from './caseworker-ref-data.service';

describe('CaseWorkerRefDataService service', () => {
    let mockedHttpClient: any;
    let service: CaseWorkerRefDataService;

    beforeEach(() => {
        mockedHttpClient = jasmine.createSpyObj('mockedHttpClient', {post: of({key: 'Some Value'})});
        service = new CaseWorkerRefDataService(mockedHttpClient);
    });

    describe('postFile()', () => {
        it('should post file with httpclient', () => {
            const formData = new FormData();
            service.postFile(formData);

            expect(mockedHttpClient.post).toHaveBeenCalledWith(CaseWorkerRefDataService.url, formData);
        });
    });
});
