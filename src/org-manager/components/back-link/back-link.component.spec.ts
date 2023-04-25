import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { BackLinkComponent } from '..';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';

describe('BackLinkComponent', () => {
  let mockStore: MockStore<fromOrganisationPendingStore.OrganisationRootState>;

  let component: BackLinkComponent;
  let fixture: ComponentFixture<BackLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule, RouterTestingModule.withRoutes([])],
      declarations: [BackLinkComponent],
      providers: [provideMockStore()]
    })
      .compileComponents();
    mockStore = TestBed.inject(MockStore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackLinkComponent);
    component = fixture.componentInstance;
    component.store = mockStore;

    fixture.detectChanges();

    spyOn(mockStore, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onGoBack()', () => {
    it('should dispatch route to pending-organisation', () => {
      component.currentUrl = 'active-organisation';
      component.onGoBack();

      expect(mockStore.dispatch).toHaveBeenCalledWith(new fromRoot.Go({ path: ['/pending-organisations'] }));
    });

    it('should dispatch route to back', () => {
      component.currentUrl = 'other-organisation';
      component.onGoBack();

      expect(mockStore.dispatch).toHaveBeenCalledWith(new fromRoot.Back());
    });
  });
});

