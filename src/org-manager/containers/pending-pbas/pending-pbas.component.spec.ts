import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { of } from 'rxjs';
import { OrganisationService, PbaService } from '../../services';
import { PendingPBAsComponent } from './pending-pbas.component';

describe('PendingPBAsComponent', () => {
  let component: PendingPBAsComponent;
  let fixture: ComponentFixture<PendingPBAsComponent>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let router: Router;
  const pbaServiceSpy = jasmine.createSpyObj('PbaService', ['setPBAStatus', 'searchPbasWithPagination']);

  beforeEach(() => {
    router = jasmine.createSpyObj('router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ExuiCommonLibModule
      ],
      providers: [
        { provide: PbaService, useValue: pbaServiceSpy },
        OrganisationService
      ],
      declarations: [
        PendingPBAsComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingPBAsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  describe('getReceivedDate', () => {
    beforeEach(() => {
      pbaServiceSpy.searchPbasWithPagination.and.returnValue(of());
      fixture.detectChanges();
    });

    it('should choose the earliest dateCreated from a list of string dates', () => {
      const pbaNumber = 'PBA1231231';
      const dateLatest = new Date('February 28, 2022 01:23:45').toISOString();
      const dateEarliest = new Date('February 21, 2022 09:10:11').toISOString();
      const pbaNumbers = [{ pbaNumber, dateCreated: dateLatest }, { pbaNumber, dateCreated: dateEarliest }];
      const receivedDate = component.getReceivedDate(pbaNumbers);
      component.orgsWithPendingPBAs = [{
        organisationId: 'test',
        admin: 'test',
        adminEmail: 'test@test.com',
        name: 'test',
        pbaNumbers: [{ pbaNumber }],
        receivedDate: dateEarliest
      }];
      expect(receivedDate).toEqual(dateEarliest);
    });

    it('should return pagenumber', () => {
      component.onPaginationHandler(3);
      expect(component.pagination.page_number).toEqual(3);
    });
  });
});
