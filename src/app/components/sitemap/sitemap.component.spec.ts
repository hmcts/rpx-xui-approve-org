import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SitemapComponent } from './sitemap.component';

describe('SitemapComponent', () => {
  let component: SitemapComponent;
  let fixture: ComponentFixture<SitemapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [SitemapComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitemapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show links to every directly accessible page', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    const destinations = links.map((link) => link.attributes.href);
    const linkText = links.map((link) => link.nativeElement.textContent.trim());

    expect(destinations).toEqual([
      '/organisation/pending',
      '/organisation/pbas',
      '/organisation/active',
      '/caseworker-details',
      '/accessibility',
      '/cookies',
      '/privacy-policy',
      '/terms-and-conditions'
    ]);
    expect(linkText).toEqual([
      'New registrations',
      'New PBAs',
      'Active organisations',
      'Staff details',
      'Accessibility statement',
      'Cookies',
      'Privacy policy',
      'Terms and conditions'
    ]);
  });
});
