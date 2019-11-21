// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { TestBed } from '@angular/core/testing';
// import { hot, cold } from 'jasmine-marbles';
// import { of, throwError } from 'rxjs';
// import { provideMockActions } from '@ngrx/effects/testing';
// import * as fromPendingOrganisationEffects from './organisation.effects';
// import { OrganisationEffects } from './organisation.effects';
// import { LoadPendingOrganisations, ApprovePendingOrganisations,
//         ApprovePendingOrganisationsSuccess, DisplayErrorMessageOrganisations } from '../actions/organisations.actions';
// import { LoadPendingOrganisationsSuccess, LoadPendingOrganisationsFail } from '../actions';
// import { PendingOrganisationService } from 'src/org-manager/services';
// import { Go } from 'src/app/store';
// import { PendingOrganisationsMockCollection1 } from '../../mock/pending-organisation.mock';
// import { Organisation, OrganisationVM } from 'src/org-manager/models/organisation';
// import { LoggerService } from 'src/app/services/logger.service';
//
// export class LoggerServiceMock {
//   error(err) {
//     return err;
//   }
// }
//
// describe('Pending Organisation Effects', () => {
//   let actions$;
//   let effects: OrganisationEffects;
//   const PendingOrganisationServiceMock = jasmine.createSpyObj('PendingOrganisationService', [
//     'fetchPendingOrganisations',
//     'approvePendingOrganisations'
//   ]);
//
//   const payload: OrganisationVM[] = PendingOrganisationsMockCollection1;
//   const mockedLoggerService = jasmine.createSpyObj('mockedLoggerService', ['trace', 'info', 'debug', 'log', 'warn', 'error', 'fatal']);
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//       providers: [
//         {
//           provide: PendingOrganisationService,
//           useValue: PendingOrganisationServiceMock,
//         },
//         fromPendingOrganisationEffects.OrganisationEffects,
//         provideMockActions(() => actions$),
//         {
//           provide: LoggerService,
//           useClass: LoggerServiceMock
//         },
//         {
//           provide: LoggerService,
//           useValue: mockedLoggerService
//         },
//       ]
//     });
//
//     effects = TestBed.get(OrganisationEffects);
//
//   });
//
//   describe('approvPendingOrganisations$', () => {
//     it('should return a collection from approvePendingOrgs$ - ApprovePendingOrganisationsSuccess', () => {
//
//       PendingOrganisationServiceMock.approvePendingOrganisations.and.returnValue(of(true));
//       const action = new ApprovePendingOrganisations(payload);
//       const completion = new ApprovePendingOrganisationsSuccess(true);
//       actions$ = hot('-a', { a: action });
//       const expected = cold('-b', { b: completion });
//       expect(effects.approvePendingOrgs$).toBeObservable(expected);
//
//       const successAction = new ApprovePendingOrganisationsSuccess(true);
//       const successCompletion = new Go({ path: ['pending-organisations/approve-success'] });
//       actions$ = hot('-a', { a: successAction });
//       const successExpected = cold('--b', { b: successCompletion });
//       expect(effects.approvePendingOrgsSuccess$).toBeObservable(successExpected);
//     });
//   });
//
//   describe('approvPendingOrganisations$ error', () => {
//     it('should return ApprovePendingOrganisationsOrganisationsFail', () => {
//       PendingOrganisationServiceMock.approvePendingOrganisations.and.returnValue(throwError(''));
//       const action = new ApprovePendingOrganisations(payload);
//       const completion = new DisplayErrorMessageOrganisations('');
//       actions$ = hot('-a', { a: action });
//       const expected = cold('-b', { b: completion });
//       expect(effects.approvePendingOrgs$).toBeObservable(expected);
//     });
//   });
// });


// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { TestBed } from '@angular/core/testing';
// import { hot, cold } from 'jasmine-marbles';
// import { of, throwError } from 'rxjs';
// import { provideMockActions } from '@ngrx/effects/testing';
// import * as fromOrganisationEffects from './organisation.effects';
// import { OrganisationEffects } from './organisation.effects';
// import { LoadOrganisation, LoadOrganisationFail } from '../actions/organisation.actions';
// import { LoadActiveOrganisationSuccess } from '../actions';
// import { OrganisationService } from 'src/org-manager/services';
// import { LoggerService } from 'src/app/services/logger.service';
//
// export class LoggerServiceMock {
//   error(err) {
//     return err;
//   }
// }
//
// describe('Organisation Effects', () => {
//   let actions$;
//   let effects: OrganisationEffects;
//   const OrganisationServiceMock = jasmine.createSpyObj('OrganisationService', [
//     'fetchOrganisations',
//   ]);
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//       providers: [
//           {
//             provide: OrganisationService,
//             useValue: OrganisationServiceMock,
//           },
//           fromOrganisationEffects.OrganisationEffects,
//           provideMockActions(() => actions$),
//           {
//             provide: LoggerService,
//             useClass: LoggerServiceMock
//           }
//       ]
//     });
//
//     effects = TestBed.get(OrganisationEffects);
//
//   });
//
//   describe('loadActiveOrganisations$ error', () => {
//     it('should return LoadOrganisationsFail', () => {
//       OrganisationServiceMock.fetchOrganisations.and.returnValue(throwError(new Error()));
//       const action = new LoadOrganisation();
//       const completion = new LoadOrganisationFail(new Error());
//       actions$ = hot('-a', { a: action });
//       const expected = cold('-b', { b: completion });
//       expect(effects.loadActiveOrganisations$).toBeObservable(expected);
//     });
//   });
//
// });
