import { Component } from '@angular/core';

/*
 * Sign Out Component
 * Responsible for displaying you been singed out page.
 * */
@Component({
  selector: 'app-sign-out',
  templateUrl: './signed-out.component.html',
})
export class SignedOutComponent {
  public redirectUrl = './';
}
