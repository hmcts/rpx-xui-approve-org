import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'identity-bar-component',
  templateUrl: './identity-bar.component.html',
  styleUrls: ['./identity-bar.component.scss']
})

export class IdentityBarComponent {

  @Input() data: any;
  
  constructor() {}

}
