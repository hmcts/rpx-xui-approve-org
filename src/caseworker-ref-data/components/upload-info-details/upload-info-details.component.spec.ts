
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CaseWorkerRefDataUploadResponse } from 'src/caseworker-ref-data/models/caseworker-ref-data.model';
import { UploadInfoDetailsComponent } from './upload-info-details.component';

describe('UploadInfoDetailsComponent', () => {
  let component: UploadInfoDetailsComponent;
  let fixture: ComponentFixture<UploadInfoDetailsComponent>;

  describe('with empty navigation data', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [UploadInfoDetailsComponent],
        providers: [
          { provide: Router, useValue: { getCurrentNavigation: () => null } }
        ],
        imports: [RouterTestingModule]
      })
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(UploadInfoDetailsComponent);
      component = fixture.componentInstance;
    });

    it('should set uploadResponse to undefined if no navigation data is present', () => {
      expect(component.uploadResponse).toBeUndefined();
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
        declarations: [UploadInfoDetailsComponent],
        providers: [
          { provide: Router, useValue: { getCurrentNavigation: () => ({ extras: { state: response } })} }
        ],
        imports: [RouterTestingModule]
      })
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(UploadInfoDetailsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set uploadResponse to state data in response', () => {
      expect(component.uploadResponse).toEqual(response);
    });
  });
});
