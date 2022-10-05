
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CaseWorkerRefDataUploadResponse } from 'src/caseworker-ref-data/models/caseworker-ref-data.model';
import { UploadInfoPartialSuccessComponent } from './upload-info-partial-success';

describe('UploadInfoPartialSuccessComponent', () => {
  let component: UploadInfoPartialSuccessComponent;
  let fixture: ComponentFixture<UploadInfoPartialSuccessComponent>;

  describe('with empty navigation data', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [UploadInfoPartialSuccessComponent],
        providers: [
          { provide: Router, useValue: { getCurrentNavigation: () => null } }
        ]
      })
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(UploadInfoPartialSuccessComponent);
      component = fixture.componentInstance;
    });

    it('should set partialErrorResp to undefined if no navigation data is present', () => {
      expect(component.partialErrorResp).toBeUndefined();
    });
  });

  describe('with navigation data', () => {
    const response: CaseWorkerRefDataUploadResponse = {
      message: 'messge',
      message_details: 'detail',
      error_details: null
    };

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [UploadInfoPartialSuccessComponent],
        providers: [
          { provide: Router, useValue: { getCurrentNavigation: () => ({ extras: { state: response } })} }
        ]
      })
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(UploadInfoPartialSuccessComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set partialErrorResp to state data in response', () => {
      expect(component.partialErrorResp).toEqual(response);
    });
  });
});
