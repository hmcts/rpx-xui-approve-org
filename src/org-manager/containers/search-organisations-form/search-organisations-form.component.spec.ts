import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchOrganisationsFormComponent } from './search-organisations-form.component';
import { GovUiModule } from 'projects/gov-ui/src/lib/gov-ui.module';

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
});
