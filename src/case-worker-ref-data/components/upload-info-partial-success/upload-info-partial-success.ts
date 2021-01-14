import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CaseWorkerRefDataUploadResponse } from '../../models/case-worker-ref-data.model';

@Component({
  selector: 'app-prd-upload-partial-success',
  templateUrl: './upload-info-partial-success.html',
})

export class UploadInfoPartialSuccessComponent {
  public readonly partialErrorResp: CaseWorkerRefDataUploadResponse;
  constructor(private readonly router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.partialErrorResp = navigation.extras.state as CaseWorkerRefDataUploadResponse;
    }
  }
}
