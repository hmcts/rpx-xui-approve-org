import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { hot, cold } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import * as fromOrganisationEffects from './organisation.effects';
import { OrganisationEffects } from './organisation.effects';
import { LoadOrganisation, LoadOrganisationFail } from '../actions/organisation.actions';
import { LoadOrganisationSuccess } from '../actions';
import { OrganisationService } from 'src/org-manager/services';
import { LoggerService } from 'src/app/services/logger.service';

export class LoggerServiceMock {
  error(err) {
    return err;
  }
}

describe('Organisation Effects', () => {
  let actions$;
  let effects: OrganisationEffects;
  const OrganisationServiceMock = jasmine.createSpyObj('OrganisationService', [
    'fetchOrganisations',
  ]);
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
          {
            provide: OrganisationService,
            useValue: OrganisationServiceMock,
          },
          fromOrganisationEffects.OrganisationEffects,
          provideMockActions(() => actions$),
          {
            provide: LoggerService,
            useClass: LoggerServiceMock
          }
      ]
    });

    effects = TestBed.get(OrganisationEffects);

  });

  describe('loadActiveOrganisations$ error', () => {
    it('should return LoadOrganisationsFail', () => {
      OrganisationServiceMock.fetchOrganisations.and.returnValue(throwError(new Error()));
      const action = new LoadOrganisation();
      const completion = new LoadOrganisationFail(new Error());
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadActiveOrganisations$).toBeObservable(expected);
    });
  });

});
