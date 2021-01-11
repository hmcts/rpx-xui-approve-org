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
      console.log(response);
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
    });
  }
}
