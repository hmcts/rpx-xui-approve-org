import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CaseWorkerRefDataUploadResponse } from '../../models/case-worker-ref-data.model';

@Component({
  selector: 'app-prd-upload-info-detail',
  templateUrl: './upload-info-details.component.html',
})

export class UploadInfoDetailsComponent {
  private readonly uploadResponse: CaseWorkerRefDataUploadResponse;
  constructor(private readonly router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.uploadResponse = navigation.extras.state as CaseWorkerRefDataUploadResponse;
    }
  }
}
