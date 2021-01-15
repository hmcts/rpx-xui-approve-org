import { of } from 'rxjs';
import { CaseWorkerDetailsComponent } from './case-worker-details.component';

describe('CaseWorkerDetailsComponent', () => {
    let component: CaseWorkerDetailsComponent;
    let caseWorkerRefDataService;
    let router;
    beforeEach(() => {
        caseWorkerRefDataService = jasmine.createSpyObj('caseWorkerRefDataService', ['postFile']);
        router = jasmine.createSpyObj('router', ['navigate'])
        component = new CaseWorkerDetailsComponent(caseWorkerRefDataService, router);
    });
    it('is Truthy', () => {
        expect(component).toBeTruthy();
    });
    it('onSubmit success', () => {
        const response = {
            message: 'message',
            message_details: 'message Details',
            error_details: []
        };
        caseWorkerRefDataService.postFile.and.returnValue(of(response));
        const file = new File([], 'fileName.xlsx');
        const fileList = {
            0: file,
            length: 1,
            item: (index: number) => file
          };
        component.onSubmit({files: fileList});
        expect(caseWorkerRefDataService.postFile).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/caseworker-details/upload-success'], {state: response})
    });
    it('onSubmit error handling', () => {
        const errorDetail =  {
            error_description: 'string',
            field_in_error: 'string',
            row_id: 2
        };
        const response = {
            message: 'message',
            message_details: 'message Details',
            error_details: [errorDetail]
        };
        caseWorkerRefDataService.postFile.and.returnValue(of(response));
        const file = new File([], 'fileName.xlsx');
        const fileList = {
            0: file,
            length: 1,
            item: (index: number) => file
          };
        component.onSubmit({files: fileList});
        expect(caseWorkerRefDataService.postFile).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/caseworker-details/partial-success'], {state: response})
    });
});
