import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'identity-bar-component',
  templateUrl: './identity-bar.component.html',
  styleUrls: ['./identity-bar.component.scss']
})

export class IdentityBarComponent implements OnInit {

  @Input() data: any;
  
  constructor() {}

  ngOnInit(): void {

  }

}
