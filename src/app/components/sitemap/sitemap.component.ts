import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../services/auth/auth.service';
import { AppUtils } from '../../utils/app-utils';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  standalone: false
})
export class SitemapComponent {
  public readonly roles$: Observable<string[]>;

  constructor(authService: AuthService, cookieService: CookieService) {
    this.roles$ = authService.isAuthenticated().pipe(
      map((authenticated) => {
        if (!authenticated) {
          return [];
        }
        const roles = AppUtils.getRoles(cookieService.get(environment.cookies.roles));
        return Array.isArray(roles) ? roles : [];
      }),
      catchError(() => of([]))
    );
  }
}
