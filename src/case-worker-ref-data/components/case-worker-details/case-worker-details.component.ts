import { CaseWorkerRefDataService } from '../../services/case-worker-ref-data.service';
import { CaseWorkerRefDataUploadResponse } from '../../models/case-worker-ref-data.model';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { handleFatalErrors } from '../../utils/case-worker-utils';

@Component({
    selector: 'app-prd-case-worker-details',
    templateUrl: './case-worker-details.component.html',
  })
export class CaseWorkerDetailsComponent {

  public errorDesc: string;
  
  public constructor(private readonly caseWorkerRefDataService: CaseWorkerRefDataService,
                     private readonly router: Router) {}

  public onSubmit(inputElement: any) {
    const formData = new FormData();
    formData.append('excel', inputElement.files.item(0));
    console.log(inputElement.files.item(0));
    this.caseWorkerRefDataService.postFile(formData).subscribe((response: CaseWorkerRefDataUploadResponse) => {
      console.log(response)
      if (response.recordsFailed) {
        // partial success path - Another JIRA
      } else {
        // route to success Page
        this.router.navigate(['/caseworker-details/upload-success'], {state: response})
      }
    },
    errorResponse => {
      // Upload errors - EUI-3014
      console.log(errorResponse);
      this.showUploadErrors(errorResponse.status);
    });
  }

  /**
   * Sort out the actual errors returned via the API
   */
  public showUploadErrors(status: number): void {

    const handledStatus = handleFatalErrors(status, this.router);
    if (handledStatus === 400) {
      this.errorDesc = "400";
    } 
    /* if (handledStatus > 0) {
      this.infoMessageCommService.nextMessage({
        type: InfoMessageType.WARNING,
        message: InfoMessage.TASK_NO_LONGER_AVAILABLE,
      });
      if (handledStatus === 400) {
        this.refreshTasks();
      }
    } */
  }
  
}


