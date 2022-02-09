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

  it('should call the selectOptionChanged output emitter when the selectOption method is called', () => {
    spyOn(component.selectOptionChanged, 'emit').and.callThrough();
    component.pbaNumber = 'PBA1234567';
    const testEvent = {
      target: {
        value: 'approve'
      }
    };
    component.selectOption(testEvent);
    expect(component.selectOptionChanged.emit).toHaveBeenCalledWith({ name: component.pbaNumber, value: testEvent.target.value });
  });
});
