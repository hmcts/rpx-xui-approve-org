import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { BackLinkComponent } from 'src/org-manager/components';
import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { reviewedOrganisationMockCollection } from '../../mock/pending-organisation.mock';
import { ApproveOrganisationComponent } from './approve-organisation.component';

describe('ApproveOrganisationComponent', () => {
  let component: ApproveOrganisationComponent;
  let fixture: ComponentFixture<ApproveOrganisationComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  let storePipeMock: any;
  let storeDispatchMock: any;
  const reviewedOrganisationsDummy = reviewedOrganisationMockCollection;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromOrganisationPendingStore.reducers)
        })
      ],
      declarations: [
        BackLinkComponent,
        ApproveOrganisationComponent
      ]
    }).compileComponents();
    store = TestBed.inject(Store);

    storePipeMock = spyOn(store, 'pipe');
    storeDispatchMock = spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(ApproveOrganisationComponent);
    component = fixture.componentInstance;
  }));

  describe('ngOnInit()', () => {
    it('should dispatch route to pending-organisation if org data empty', () => {
      storePipeMock.and.returnValue(of(null));

      component.ngOnInit();

      expect(storeDispatchMock).toHaveBeenCalled();
    });
  });

  it('should dispatch a pending organisation "approve" action when reviewed activeOrg are approved', () => {
    storePipeMock.and.returnValue(of({ reviewedOrganisations: reviewedOrganisationsDummy }));
    fixture.detectChanges();
    component.onApproveOrganisations();
    fixture.detectChanges();
    expect(component.disabled).toBeFalsy();
  });
});
