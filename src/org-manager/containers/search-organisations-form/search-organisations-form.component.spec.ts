import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { RpxTranslationService } from 'rpx-xui-translation';

import { OrganisationService } from '../../services';
import { SearchOrganisationsFormComponent } from './search-organisations-form.component';

describe('SearchOrganisationsFormComponent', () => {
  let component: SearchOrganisationsFormComponent;
  let fixture: ComponentFixture<SearchOrganisationsFormComponent>;
  const translationMockService = jasmine.createSpyObj('translationMockService', ['translate', 'getTranslation$']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchOrganisationsFormComponent],
      imports: [FormsModule, ReactiveFormsModule, ExuiCommonLibModule, HttpClientTestingModule],
      providers: [OrganisationService, { provide: RpxTranslationService, useValue: translationMockService }]
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
