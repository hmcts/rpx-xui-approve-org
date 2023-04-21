import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CaseWorkerRefDataUploadResponse } from '../../models/caseworker-ref-data.model';

@Component({
  selector: 'app-prd-upload-info-detail',
  templateUrl: './upload-info-details.component.html'
})

export class UploadInfoDetailsComponent {
  public readonly uploadResponse: CaseWorkerRefDataUploadResponse;
  constructor(private readonly router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.uploadResponse = navigation.extras.state as CaseWorkerRefDataUploadResponse;
    }
  }
}
