import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SearchOrganisationRequest } from '../../models/dtos';
import { Organisation } from '../models/organisation';

export const MOCK_ORGANISATION: Organisation = {
  organisationIdentifier: 'MOCK1',
  name: 'Mock Organisation 1',
  contactInformation: [{
    addressLine1: '123 Test Street',
    addressLine2: '',
    addressLine3: '',
    townCity: 'London',
    county: '',
    postCode: 'SW1A 1AA',
    dxAddress: [{
      dxNumber: 'DX 1234567890',
      dxExchange: 'London'
    }]
  }],
  superUser: {
    userIdentifier: 'mock-user-1',
    firstName: 'Test',
    lastName: 'Admin',
    email: 'admin1@example.com'
  },
  status: 'PENDING',
  companyNumber: '01234567',
  sraId: 'MOCKSRA1',
  orgType: 'Solicitor',
  paymentAccount: [],
  pendingPaymentAccount: [],
  dateRequested: new Date('2026-11-12T00:00:00.000Z'),
  orgAttributes: []
};

@Injectable()
export class OrganisationService {
  public singleOrgUrl = environment.singleOrgUrl;
  public orgActiveUrl = environment.orgActiveUrl;
  public orgPendingUrl = environment.orgPendingUrl;
  public orgUsersUrl = environment.organisationUsersUrl;
  public organisationsUrl = environment.organisationsUrl;
  private readonly organisationSearchString: Subject<string> = new Subject<string>();
  private readonly resetPagination: Subject<boolean> = new Subject<boolean>();
  constructor(private readonly http: HttpClient) { }

  public organisationSearchStringChange(): Observable<string> {
    return this.organisationSearchString.asObservable();
  }

  public setOrganisationSearchString(value: string) {
    this.organisationSearchString.next(value || '');
  }

  public paginationParametersReset(): Observable<boolean> {
    return this.resetPagination.asObservable();
  }

  public resetPaginationParameters() {
    this.resetPagination.next(true);
  }

  public fetchOrganisations(): Observable<Organisation[]> {
    const organisations$ = this.http.get<Organisation[]>(this.orgActiveUrl);
    return organisations$;
  }

  public getSingleOrganisation(payload: { id: string, version?: string }): Observable<Organisation> {
    const params = new HttpParams().append('organisationId', payload.id).append('version', payload.version ? payload.version : 'v1');
    return this.http.get<Organisation>(this.singleOrgUrl, { params });
  }

  // Fetch a mock organisation based on the provided ID and version
  // TODO: Replace with above or with actual API endpoint for mock organisation
  public getMockOrganisation(payload: { id: string, version?: string }): Observable<Organisation> {
    return of({
      ...MOCK_ORGANISATION,
      organisationIdentifier: payload.id
    });
  }

  public getOrganisationUpdate(payload: { id: string, version?: string }): Observable<Organisation> {
    return this.getSingleOrganisation(payload).pipe(
      // Keep the prototype update journey usable until its backend records are available.
      catchError(() => this.getMockOrganisation(payload))
    );
  }

  public getOrganisationUsers(orgId, pageNo): Observable<any> {
    return this.http.get<any>(`${this.orgUsersUrl}${orgId}&page=${pageNo}`);
  }

  public deleteOrganisation(payload: Organisation): Observable<Response> {
    return this.http.delete<Response>(`${this.organisationsUrl}${payload.organisationIdentifier}`);
  }

  public getOrganisationDeletableStatus(payload: string): Observable<any> {
    // An active organisation is deletable if the sole user's status is "Pending". In all other scenarios, the
    // organisation is not deletable.
    return this.http.get<any>(`${this.organisationsUrl}${payload}/isDeletable`);
  }

  public searchOrganisationWithPagination(body: { searchRequest: SearchOrganisationRequest, view: string }): Observable<Organisation[]> {
    return this.http.post<Organisation[]>(body.view === 'NEW' ? this.orgPendingUrl : this.orgActiveUrl, body);
  }

  public searchOrganisationUpdatesWithPagination(
    body: { searchRequest: SearchOrganisationRequest }
  ): Observable<{ organisations: Organisation[]; total_records: number }> {
    // Mock data for organisation updates with pagination
    const mockOrganisations: Organisation[] = Array.from(
      { length: 25 },
      (_, index) => ({
        organisationIdentifier: `MOCK${index + 1}`,
        name: `Mock Organisation ${index + 1}`,
        contactInformation: [{
          addressLine1: '123 Test Street',
          addressLine2: '',
          townCity: 'London',
          county: '',
          postCode: 'SW1A 1AA',
          dxAddress: [{ dxNumber: 'DX 12345', dxExchange: 'London' }]
        }],
        superUser: {
          userIdentifier: `mock-user-${index + 1}`,
          firstName: 'Test',
          lastName: 'Admin',
          email: `admin${index + 1}@example.com`
        },
        paymentAccount: [],
        pendingPaymentAccount: [],
        status: 'PENDING',
        dateRequested: new Date()
      })
    );

    const { searchRequest } = body;
    const search = (searchRequest.search_filter || '').trim().toLowerCase();
    const filtered = mockOrganisations.filter((organisation) =>
      organisation.name.toLowerCase().includes(search) ||
      organisation.organisationIdentifier.toLowerCase().includes(search)
    );

    const { page_number, page_size } = searchRequest.pagination_parameters || {
      page_number: 1,
      page_size: 10
    };
    const start = (page_number - 1) * page_size;

    return of({
      organisations: filtered.slice(start, start + page_size),
      total_records: filtered.length
    });
  }
}
