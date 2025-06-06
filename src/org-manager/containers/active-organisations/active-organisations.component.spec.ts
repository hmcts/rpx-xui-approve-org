import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../app/store/reducers';
import * as fromStore from '../../../org-manager/store';
import { OrganisationAddressComponent } from '../../components/organisation-address';
import { OrganisationService } from '../../services';
import { ActiveOrganisationsComponent } from './active-organisations.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('Active Organisation', () => {
  let component: ActiveOrganisationsComponent;
  let fixture: ComponentFixture<ActiveOrganisationsComponent>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
});
