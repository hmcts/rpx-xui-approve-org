import { Component } from '@angular/core';
import { CaseWorkerRefDataService } from '../../services/case-worker-ref-data.service';
import { CaseWorkerRefDataUploadResponse } from '../../models/case-worker-ref-data.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-prd-case-worker-details',
    templateUrl: './case-worker-details.component.html',
  })
export class CaseWorkerDetailsComponent {

  public constructor(private readonly caseWorkerRefDataService: CaseWorkerRefDataService,
                     private readonly router: Router) {}

  public onSubmit(inputElement: any) {
    const formData = new FormData();
    formData.append('excel', inputElement.files.item(0));
    this.caseWorkerRefDataService.postFile(formData).subscribe((response: CaseWorkerRefDataUploadResponse) => {
      if (response.error_details && response.error_details.length > 0) {
        this.router.navigate(['/caseworker-details/partial-success'], {state: response});
      } else {
        this.router.navigate(['/caseworker-details/upload-success'], {state: response})
      }
    },
    errorResponse => {
      // Upload errors - EUI-3014
      console.log(errorResponse);
    });
  }
}
