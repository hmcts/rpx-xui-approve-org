import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-identity-bar-component',
  templateUrl: './identity-bar.component.html',
  styleUrls: ['./identity-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class IdentityBarComponent {
  @Input() public data: any;
}
