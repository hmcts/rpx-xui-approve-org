import { of, throwError } from 'rxjs';
import { CaseWorkerDetailsComponent } from './caseworker-details.component';

describe('CaseWorkerDetailsComponent', () => {
  let component: CaseWorkerDetailsComponent;
  let caseWorkerRefDataService;
  let router;

  beforeEach(() => {
    caseWorkerRefDataService = jasmine.createSpyObj('caseWorkerRefDataService', ['postFile']);
    router = jasmine.createSpyObj('router', ['navigate']);
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
      item: () => file
    };
    component.onSubmit({ files: fileList });
    expect(caseWorkerRefDataService.postFile).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/caseworker-details/upload-success'], { state: response });
  });

  it('onSubmit failure to upload', () => {
    const response = {
      status: 400,
      error: {
        errorDescription: 'Not Found'
      }
    };
    caseWorkerRefDataService.postFile.and.returnValue(throwError(response));
    const file = new File([], 'fileName.xlsx');
    const fileList = {
      0: file,
      length: 1,
      item: () => file
    };
    component.onSubmit({ files: fileList });
    expect(caseWorkerRefDataService.postFile).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalledWith(['/caseworker-details/upload-success'], { state: response });
    expect(component.errorDesc).toEqual('Not Found');
  });

  it('onSubmit error - no file', () => {
    const response = {
      message: 'message',
      message_details: 'message Details',
      error_details: []
    };
    caseWorkerRefDataService.postFile.and.returnValue(of(response));
    const file = new File([], 'fileName.xlsx');
    const fileList = {
      0: file,
      length: 0,
      item: () => null
    };
    component.onSubmit({ files: fileList });
    expect(caseWorkerRefDataService.postFile).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalledWith(['/caseworker-details/upload-success'], { state: response });
    expect(component.errorDesc).toEqual('You need to select a file to upload. Please try again.');
  });

  it('onSubmit error handling', () => {
    const errorDetail = {
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
      item: () => file
    };
    component.onSubmit({ files: fileList });
    expect(caseWorkerRefDataService.postFile).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/caseworker-details/partial-success'], { state: response });
  });
});
