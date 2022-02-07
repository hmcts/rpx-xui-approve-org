import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PBAAccountApprovalComponent } from './pba-account-approval.component';

describe('NewPBAsInfoComponent', () => {
  let component: PBAAccountApprovalComponent;
  let fixture: ComponentFixture<PBAAccountApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule, RouterTestingModule.withRoutes([])],
      declarations: [PBAAccountApprovalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PBAAccountApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
