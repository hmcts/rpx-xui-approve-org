import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NotAuthorisedComponent } from './not-authorised.component';

describe('NotAuthorisedComponent', () => {
  let component: NotAuthorisedComponent;
  let fixture: ComponentFixture<NotAuthorisedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NotAuthorisedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotAuthorisedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render not authorised content', () => {
    const headingElement = fixture.debugElement.query(By.css('.govuk-heading-xl')).nativeElement;
    const bodyElement = fixture.debugElement.query(By.css('.govuk-body')).nativeElement;

    expect(headingElement.textContent).toContain('Sorry, you\'re not authorised to perform this action');
    expect(bodyElement.textContent).toContain('Try again later.');
  });
});
