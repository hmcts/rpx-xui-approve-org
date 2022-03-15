import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BackLinkComponent } from '..';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('BackLinkComponent', () => {
  let component: BackLinkComponent;
  let fixture: ComponentFixture<BackLinkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RouterModule, RouterTestingModule.withRoutes([]) ],
      declarations: [ BackLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
