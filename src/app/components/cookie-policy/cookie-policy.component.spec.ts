import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CookiePolicyComponent } from './cookie-policy.component';

describe('CookiePolicyComponent', () => {
  let component: CookiePolicyComponent;
  let fixture: ComponentFixture<CookiePolicyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CookiePolicyComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CookiePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render cookie policy content', () => {
    const headingElement = fixture.debugElement.query(By.css('.govuk-heading-xl')).nativeElement;
    const tableElements = fixture.debugElement.queryAll(By.css('.govuk-table'));

    expect(headingElement.textContent).toContain('Cookies');
    expect(tableElements.length).toBeGreaterThan(0);
  });
});
