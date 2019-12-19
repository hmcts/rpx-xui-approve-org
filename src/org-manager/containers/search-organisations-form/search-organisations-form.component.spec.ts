import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GovUiModule } from 'projects/gov-ui/src/lib/gov-ui.module';
import { SearchOrganisationsFormComponent } from './search-organisations-form.component';

describe('SearchOrganisationsFormComponent', () => {
  let component: SearchOrganisationsFormComponent;
  let fixture: ComponentFixture<SearchOrganisationsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchOrganisationsFormComponent ],
      imports: [FormsModule, ReactiveFormsModule, GovUiModule]
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
    component.onSubmit();
    expect(component.submitForm.emit).toHaveBeenCalledTimes(0);
    component.searchOrgForm.controls.search.setValue('test');
    component.onSubmit();
    expect(component.submitForm.emit).toHaveBeenCalledWith('test');
  });
});
