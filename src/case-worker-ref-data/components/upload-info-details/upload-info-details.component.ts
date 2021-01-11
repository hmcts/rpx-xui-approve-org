import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CaseWorkerRefDataUploadResponse } from '../../models/case-worker-ref-data.model';

@Component({
  selector: 'app-prd-upload-info-detail',
  templateUrl: './upload-info-details.component.html',
})

export class UploadInfoDetailsComponent implements OnInit {
  private readonly uploadResponse: CaseWorkerRefDataUploadResponse;
  public createdOrAmendedRecords: number;
  public suspendedRecords: number;
  constructor(private readonly router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.uploadResponse = navigation.extras.state as CaseWorkerRefDataUploadResponse;
    }
  }
  public ngOnInit() {
    console.log(this.uploadResponse);
    this.createdOrAmendedRecords = this.uploadResponse.recordsAmended + this.uploadResponse.recordsCreated;
    this.suspendedRecords = this.uploadResponse.recordsDeleted;
  }
}
