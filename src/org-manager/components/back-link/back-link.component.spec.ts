import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BackLinkComponent } from '..';
import { StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../app/store';
import { ActivatedRoute, RouterModule, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('BackLinkComponent', () => {
  let component: BackLinkComponent;
  let fixture: ComponentFixture<BackLinkComponent>;

  let store = jasmine.createSpyObj('store', ['dispatch']);
  let router: ActivatedRoute;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RouterModule, RouterTestingModule.withRoutes([]), StoreModule.forRoot({}) ],
      declarations: [ BackLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    router = TestBed.inject(ActivatedRoute);
    component.store = store;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('onGoBack()', () => {
    it('should go back to pending-organisations if on active-organisation URL path', () => {
      router.url = of([new UrlSegment('active-organisation', {})]);

      component.ngOnInit();
      fixture.detectChanges();

      component.onGoBack();

      expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.Go({path: ['/pending-organisations']}));
    });

    it('should go back to normal history if not on active-organisation URL path', () => {
      router.url = of([new UrlSegment('not-active-organisation', {})]);

      component.ngOnInit();
      fixture.detectChanges();

      component.onGoBack();

      expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.Back());
    });
  });
});
