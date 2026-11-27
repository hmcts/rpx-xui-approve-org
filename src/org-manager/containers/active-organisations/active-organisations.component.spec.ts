import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule, LoadingService } from '@hmcts/rpx-xui-common-lib';
import { Store, StoreModule } from '@ngrx/store';
import { RpxTranslationService } from 'rpx-xui-translation';
import { firstValueFrom, of } from 'rxjs';
import * as fromRoot from '../../../app/store/reducers';
import * as fromStore from '../../../org-manager/store';
import { OrganisationAddressComponent } from '../../components/organisation-address';
import { OrganisationService } from '../../services';
import { ActiveOrganisationsComponent } from './active-organisations.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('Active Organisation', () => {
  let component: ActiveOrganisationsComponent;
  let fixture: ComponentFixture<ActiveOrganisationsComponent>;
  let store: Store<fromStore.OrganisationRootState>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [
        ActiveOrganisationsComponent,
        OrganisationAddressComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule,
        StoreModule.forRoot({
          ...fromRoot.reducers
        }),
        ExuiCommonLibModule],
      providers: [
        [OrganisationService],
        { provide: RpxTranslationService, useValue: { getTranslation$: (text: string) => of(text) } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    store = TestBed.inject(Store);

    fixture = TestBed.createComponent(ActiveOrganisationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('cancels the older HTTP search and shows the latest page and total', async () => {
    const service = TestBed.inject(OrganisationService);
    const http = TestBed.inject(HttpTestingController);
    const initial = http.expectOne(service.orgActiveUrl);
    component.pagination.page_number = 2;
    service.setOrganisationSearchString('Smith SW1A 1AA');
    const latest = http.expectOne(service.orgActiveUrl);

    expect(initial.cancelled).toBeTrue();
    expect(latest.request.body.searchRequest).toEqual(jasmine.objectContaining({
      search_filter: 'Smith SW1A 1AA',
      pagination_parameters: { page_number: 2, page_size: 10 }
    }));
    latest.flush({
      organisations: [{ organisationIdentifier: 'SMITH01', name: 'Smith', status: 'ACTIVE' }],
      total_records: 12
    });
    expect(component.organisations.map((organisation) => organisation.organisationId)).toEqual(['SMITH01']);
    expect(component.organisationCount).toBe(12);
    expect(await firstValueFrom(TestBed.inject(LoadingService).isLoading)).toBeFalse();
    http.verify();
  });

  it('cancels an in-flight search when leaving the list', async () => {
    const http = TestBed.inject(HttpTestingController);
    const pending = http.expectOne(TestBed.inject(OrganisationService).orgActiveUrl);
    fixture.destroy();

    expect(pending.cancelled).toBeTrue();
    expect(await firstValueFrom(TestBed.inject(LoadingService).isLoading)).toBeFalse();
    http.verify();
  });
});
