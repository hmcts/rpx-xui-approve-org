import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../store';

@Component({
  selector: 'app-hmcts-global-header',
  templateUrl: './hmcts-global-header.component.html'
})
export class HmctsGlobalHeaderComponent {
  @Input() public set userLoggedIn(value) {
    this.userValue = value;
  }

  @Input() public serviceName;
  @Input() public navigation;
  @Output() public navigate = new EventEmitter<string>();

  public userValue: any;
  constructor(public store: Store<fromRoot.State>) {}

  public onEmitEvent(index) {
    this.navigate.emit(this.navigation.items[index].emit);
  }
}
