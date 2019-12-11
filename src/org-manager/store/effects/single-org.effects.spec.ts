import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { hot, cold } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import * as fromSingleOrgEffects from './single-org.effects';
import { SingleOrgEffects } from './single-org.effects';
import { LoadSingleOrg, LoadSingleOrgFail} from '../actions/single-org.actions';
import { LoadSingleOrgSuccess } from '../actions';
import { OrganisationService } from 'src/org-manager/services';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
import { LoggerService } from 'src/app/services/logger.service';

export class LoggerServiceMock {
  error(err) {
    return err;
  }
}

describe('Single organisation Effects', () => {
  let actions$;
  let effects: SingleOrgEffects;
  const OrganisationServiceMock = jasmine.createSpyObj('OrganisationService', [
    'getSingleOrganisation',
  ]);
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
          {
            provide: OrganisationService,
            useValue: OrganisationServiceMock,
          },
          fromSingleOrgEffects.SingleOrgEffects,
          provideMockActions(() => actions$),
          {
            provide: LoggerService,
            useClass: LoggerServiceMock
          }
      ]
    });

    effects = TestBed.get(SingleOrgEffects);

  });

  describe('loadSingleOrg$ error', () => {
    it('should return LoadSingleOrgFail', () => {
      OrganisationServiceMock.getSingleOrganisation.and.returnValue(throwError(new Error()));
      const action = new LoadSingleOrg({});
      const completion = new LoadSingleOrgFail(new Error());
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadSingleOrg$).toBeObservable(expected);
    });
  });

});
