import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PBAAccountApprovalComponent } from './pba-account-approval.component';

describe('NewPBAsInfoComponent', () => {
  let component: PBAAccountApprovalComponent;
  let fixture: ComponentFixture<PBAAccountApprovalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule, ReactiveFormsModule, FormsModule, RouterTestingModule.withRoutes([])],
      declarations: [PBAAccountApprovalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PBAAccountApprovalComponent);
    component = fixture.componentInstance;
    component.pbaNumber = 'PBA0101012';
    component.formGroup = new FormGroup({
      PBA0101012: new FormControl('PBA0101012', Validators.required)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call the selectOptionChanged output emitter when the selectOption method is called', () => {
    spyOn(component.selectOptionChanged, 'emit').and.callThrough();
    component.pbaNumber = 'PBA0101012';
    const testEvent = {
      target: {
        value: 'approve'
      }
    };
    component.selectOption(testEvent);
    expect(component.selectOptionChanged.emit).toHaveBeenCalledWith({ name: component.pbaNumber, value: testEvent.target.value });
  });
});
