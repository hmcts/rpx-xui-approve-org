import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsAndConditionsComponent } from './terms-and-conditions.component';

describe('TermsAndConditionsComponent', () => {
  let fixture: ComponentFixture<TermsAndConditionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TermsAndConditionsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    fixture = TestBed.createComponent(TermsAndConditionsComponent);
    fixture.detectChanges();
  });

  it('Is Truthy', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('announces when every external link opens in a new tab', () => {
    const newTabLinks = fixture.nativeElement.querySelectorAll('a[target="_blank"]');

    newTabLinks.forEach((link: HTMLAnchorElement) => {
      const announcement = link.querySelector('.govuk-visually-hidden');
      expect(announcement?.textContent).toContain('opens in a new tab');
    });
  });
});
