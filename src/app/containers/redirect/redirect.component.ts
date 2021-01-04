import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie";
import { AppUtils } from "src/app/utils/app-utils";

@Component({
    selector: 'app-redirect',
    template: ``
  })

export class RedirectComponent implements OnInit {
    constructor(private readonly cookieService: CookieService, private router: Router) {}
    ngOnInit() {
        const encodedRoles = this.cookieService.getObject('roles');
        if (encodedRoles) {
          const roles = AppUtils.getRoles(encodedRoles);
          if(roles.includes('prd-admin')) {
            this.router.navigate(['pending-organisations'])
          } else if(roles.includes('')) {
            // EUI-2987
          }
        }
    }
}