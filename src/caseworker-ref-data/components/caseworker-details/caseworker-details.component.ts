import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { handleFatalErrors } from '../../../shared/utils/handle-fatal-errors';
import { CaseWorkerRefDataUploadResponse } from '../../models/caseworker-ref-data.model';
import { CaseWorkerRefDataService } from '../../services/caseworker-ref-data.service';

@Component({
  selector: 'app-prd-caseworker-details',
  templateUrl: './caseworker-details.component.html'
})
export class CaseWorkerDetailsComponent {
  public errorDesc: string;

  public constructor(
    private readonly caseWorkerRefDataService: CaseWorkerRefDataService,
    private readonly router: Router) {}

  public onSubmit(inputElement: any) {
    const formData = new FormData();
    if (!inputElement.files.item(0)) {
      // if there is no file attached
      this.errorDesc = 'You need to select a file to upload. Please try again.';
      return;
    }
    formData.append('file', inputElement.files.item(0));
    this.caseWorkerRefDataService.postFile(formData).subscribe((response: CaseWorkerRefDataUploadResponse) => {
      if (response.error_details && response.error_details.length > 0) {
        this.router.navigate(['/caseworker-details/partial-success'], { state: response });
      } else {
        this.router.navigate(['/caseworker-details/upload-success'], { state: response });
      }
    },
    (errorResponse) => {
      // Upload errors - EUI-3014
      this.showUploadErrors(errorResponse);
    });
  }

  /**
   * Sort out the actual errors returned via the API
   */
  public showUploadErrors(errorResponse: any): void {
    // redirect to the correct page as is necessary
    const handledStatus = handleFatalErrors(errorResponse.status, this.router);

    // if the error is a 400 then use the error description as the display message
    if (handledStatus === 400) {
      this.errorDesc = errorResponse.error.errorDescription;
    }
  }
}

