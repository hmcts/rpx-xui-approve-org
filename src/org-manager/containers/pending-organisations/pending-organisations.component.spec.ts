import { HttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';

import * as fromRoot from '../../../app/store/reducers';
import * as fromStore from '../../../org-manager/store';
import { OrganisationAddressComponent } from '../../components/organisation-address';
import { FilterOrganisationsPipe } from '../../pipes';
import { OrganisationService } from '../../services';
import { PendingOrganisationsComponent } from './pending-organisations.component';

describe('PendingOrganisationComponent', () => {
  let component: PendingOrganisationsComponent;
  let fixture: ComponentFixture<PendingOrganisationsComponent>;
  let store: Store<fromStore.OrganisationRootState>;
  let httpClient: HttpClient;
  @Pipe({ name: 'paginate' })
  class MockPipe implements PipeTransform {
    transform(value: number): number {
      return value;
    }
  }
  beforeEach((() => {
    httpClient = jasmine.createSpyObj<HttpClient>('httpClient', ['get', 'post', 'put', 'delete']);
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          ...fromRoot.reducers
        }),
      ],
      declarations: [
        PendingOrganisationsComponent,
        FilterOrganisationsPipe,
        OrganisationAddressComponent,
        MockPipe
      ],
      providers: [
        { provide: HttpClient, useValue: httpClient },
        OrganisationService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(PendingOrganisationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});

