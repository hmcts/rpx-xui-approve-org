import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { AppUtils } from 'src/app/utils/app-utils';

@Component({
    selector: 'app-redirect',
    template: ``
  })

export class RedirectComponent implements OnInit {
  constructor(private readonly cookieService: CookieService, private router: Router) {}
  public ngOnInit() {
      const encodedRoles = this.cookieService.getObject('roles');
      const url = this.getRedirectUrl(encodedRoles);
      if (url) {
        this.router.navigate([url]);
      }
    }

  public getRedirectUrl(encodedRoles: any): string {
    if (encodedRoles) {
      const roles = AppUtils.getRoles(encodedRoles);
      if (roles.includes('prd-admin')) {
        return 'organisation';
      } else if (roles.includes('cwd-admin')) {
        return 'caseworker-details';
      }
      return null;
    }
  }
}
