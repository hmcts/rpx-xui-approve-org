import { Component } from '@angular/core';
import { CaseWorkerRefDataService } from '../../services/case-worker-ref-data.service';

@Component({
    selector: 'app-prd-case-worker-details',
    templateUrl: './case-worker-details.component.html',
  })
export class CaseWorkerDetailsComponent {

  public constructor(private readonly caseWorkerRefDataService: CaseWorkerRefDataService) {}

  public onSubmit(inputElement) {
    const formData = new FormData();
    formData.append('excel', inputElement.files.item(0));
    this.caseWorkerRefDataService.postFile(formData).subscribe(result => console.log(result));
  }
}
