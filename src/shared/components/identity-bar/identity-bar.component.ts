import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-identity-bar-component',
  templateUrl: './identity-bar.component.html',
  styleUrls: ['./identity-bar.component.scss']
})
export class IdentityBarComponent {
  @Input() public data: any;
}
