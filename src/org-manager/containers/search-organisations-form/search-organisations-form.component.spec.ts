import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { SearchOrganisationsFormComponent } from './search-organisations-form.component';

describe('SearchOrganisationsFormComponent', () => {
  let component: SearchOrganisationsFormComponent;
  let fixture: ComponentFixture<SearchOrganisationsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchOrganisationsFormComponent ],
      imports: [FormsModule, ReactiveFormsModule, ExuiCommonLibModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchOrganisationsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call the output submitForm when onSubmit is called', () => {
    spyOn(component.submitForm, 'emit').and.callThrough();
    component.searchOrgForm.controls.search.setValue('test');
    component.onSubmit();
    expect(component.submitForm.emit).toHaveBeenCalledWith('test');
  });

  it('onReset should call submitForm with empty string', () => {
    spyOn(component.submitForm, 'emit').and.callThrough();
    component.searchOrgForm.controls.search.setValue('test');
    component.onReset();
    expect(component.submitForm.emit).toHaveBeenCalledWith('');
  });
});
