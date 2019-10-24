import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, throwError } from 'rxjs';
import { LoggerService } from 'src/app/services/logger.service';
import { OrganisationService } from 'src/org-manager/services';
import { LoadOrganisation, LoadOrganisationFail } from '../actions/organisation.actions';
import * as fromOrganisationEffects from './organisation.effects';

export class LoggerServiceMock {
  public error(err: any) {
    return err;
  }
}

describe('Organisation Effects', () => {
  let actions$: Observable<any>;
  let effects: fromOrganisationEffects.OrganisationEffects;
  const organisationServiceMock = jasmine.createSpyObj('OrganisationService', [
    'fetchOrganisations',
  ]);
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
          {
            provide: OrganisationService,
            useValue: organisationServiceMock,
          },
          fromOrganisationEffects.OrganisationEffects,
          provideMockActions(() => actions$),
          {
            provide: LoggerService,
            useClass: LoggerServiceMock
          }
      ]
    });

    effects = TestBed.get(fromOrganisationEffects.OrganisationEffects);

  });

  describe('loadOrganisations$ error', () => {
    it('should return LoadOrganisationsFail', () => {
      organisationServiceMock.fetchOrganisations.and.returnValue(throwError(new Error()));
      const action = new LoadOrganisation();
      const completion = new LoadOrganisationFail(new Error());
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadOrganisations$).toBeObservable(expected);
    });
  });

});
