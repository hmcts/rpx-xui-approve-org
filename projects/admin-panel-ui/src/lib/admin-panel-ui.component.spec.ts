import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPanelUiComponent } from './admin-panel-ui.component';

describe('AdminPanelUiComponent', () => {
  let component: AdminPanelUiComponent;
  let fixture: ComponentFixture<AdminPanelUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminPanelUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPanelUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
