import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie';
import { Subject } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { SitemapComponent } from './sitemap.component';

describe('SitemapComponent', () => {
  let fixture: ComponentFixture<SitemapComponent>;
  let authentication: Subject<boolean>;
  let cookieService: jasmine.SpyObj<CookieService>;
  const helpLinks = ['/accessibility', '/cookies', '/privacy-policy', '/terms-and-conditions', '/sitemap'];
  const organisationLinks = ['/organisation/pending', '/organisation/pbas', '/organisation/active'];

  beforeEach(waitForAsync(() => {
    authentication = new Subject<boolean>();
    cookieService = jasmine.createSpyObj('CookieService', ['get']);
    TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule],
      declarations: [SitemapComponent],
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => authentication } },
        { provide: CookieService, useValue: cookieService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitemapComponent);
    fixture.detectChanges();
  });

  function destinations(): string[] {
    return fixture.debugElement.queryAll(By.css('a')).map((link) => link.attributes.href);
  }

  function setAccess(authenticated: boolean, roles: string[]): void {
    cookieService.get.and.returnValue(encodeURIComponent(`j:${JSON.stringify(roles)}`));
    authentication.next(authenticated);
    fixture.detectChanges();
  }

  it('should show only help links while authentication is pending', () => {
    expect(destinations()).toEqual(helpLinks);
  });

  it('should hide restricted links and headings when signed out, even with role cookies', () => {
    setAccess(false, ['prd-admin', 'cwd-admin']);
    expect(destinations()).toEqual(helpLinks);
    const headings = fixture.debugElement.queryAll(By.css('h2')).map((heading) => heading.nativeElement.textContent.trim());
    expect(headings).toEqual(['Help and information']);
  });

  it('should show organisation links for a signed-in organisation administrator', () => {
    setAccess(true, ['prd-admin']);
    expect(destinations()).toEqual([...organisationLinks, ...helpLinks]);
  });

  it('should show staff links for a signed-in staff administrator', () => {
    setAccess(true, ['cwd-admin']);
    expect(destinations()).toEqual(['/caseworker-details', ...helpLinks]);
  });

  it('should show both sections for a signed-in user with both roles', () => {
    setAccess(true, ['prd-admin', 'cwd-admin']);
    expect(destinations()).toEqual([...organisationLinks, '/caseworker-details', ...helpLinks]);
  });

  it('should hide restricted links for unrelated or partially matching roles', () => {
    setAccess(true, ['other-role', 'prd-admin-extra', 'cwd-admin-extra']);
    expect(destinations()).toEqual(helpLinks);
  });

  it('should hide restricted links when the roles cookie is missing', () => {
    authentication.next(true);
    fixture.detectChanges();
    expect(destinations()).toEqual(helpLinks);
  });

  ['j:invalid', 'j:null', 'j:"prd-admin"', '%'].forEach((cookie) => {
    it(`should hide restricted links for malformed roles: ${cookie}`, () => {
      cookieService.get.and.returnValue(cookie);
      authentication.next(true);
      fixture.detectChanges();
      expect(destinations()).toEqual(helpLinks);
    });
  });

  it('should keep help links visible if the authentication check fails', () => {
    authentication.error(new Error('Authentication unavailable'));
    fixture.detectChanges();
    expect(destinations()).toEqual(helpLinks);
  });
});
