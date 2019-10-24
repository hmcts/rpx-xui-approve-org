import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, throwError } from 'rxjs';
import { LoggerService } from 'src/app/services/logger.service';
import { OrganisationService } from 'src/org-manager/services';
import { LoadSingleOrg, LoadSingleOrgFail } from '../actions/single-org.actions';
import * as fromSingleOrgEffects from './single-org.effects';

export class LoggerServiceMock {
  public error(err: any) {
    return err;
  }
}

describe('Single organisation Effects', () => {
  let actions$: Observable<any>;
  let effects: fromSingleOrgEffects.SingleOrgEffects;
  const organisationServiceMock = jasmine.createSpyObj('OrganisationService', [
    'getSingleOrganisation',
  ]);
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
          {
            provide: OrganisationService,
            useValue: organisationServiceMock,
          },
          fromSingleOrgEffects.SingleOrgEffects,
          provideMockActions(() => actions$),
          {
            provide: LoggerService,
            useClass: LoggerServiceMock
          }
      ]
    });

    effects = TestBed.get(fromSingleOrgEffects.SingleOrgEffects);

  });

  describe('loadSingleOrg$ error', () => {
    it('should return LoadSingleOrgFail', () => {
      organisationServiceMock.getSingleOrganisation.and.returnValue(throwError(new Error()));
      const action = new LoadSingleOrg({});
      const completion = new LoadSingleOrgFail(new Error());
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadSingleOrg$).toBeObservable(expected);
    });
  });

});
