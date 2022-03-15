import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../app/store/reducers';
import * as fromStore from '../../../org-manager/store';
import { OrganisationAddressComponent } from '../../components/organisation-address';
import { OrganisationService } from '../../services';
import { ActiveOrganisationsComponent } from './active-organisations.component';

describe('Active Organisation', () => {
  let component: ActiveOrganisationsComponent;
  let fixture: ComponentFixture<ActiveOrganisationsComponent>;
  let store: Store<fromStore.OrganisationRootState>;
  @Pipe({ name: 'paginate' })
  class MockPipe implements PipeTransform {
    transform(value: number): number {
      return value;
    }
  }
  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          ...fromRoot.reducers
        }),
        HttpClientTestingModule
      ],
      declarations: [
        ActiveOrganisationsComponent,
        OrganisationAddressComponent,
        MockPipe
      ],
      providers: [
        [ OrganisationService ]
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(ActiveOrganisationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});
