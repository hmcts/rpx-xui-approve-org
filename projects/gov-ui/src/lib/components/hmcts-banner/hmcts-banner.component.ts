import {Component, Directive, Input} from '@angular/core';

/*
* Hmcts Banner
* Responsible for displaying prominent message and related actions
* @prop message to display
* @prop type
* */
@Component({
  selector: 'lib-banner',
  template: `<div class="hmcts-banner hmcts-banner--{{type}}">
      <svg class="hmcts-banner__icon" fill="currentColor" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" height="25" width="25">
          <path d="M13.6,15.4h-2.3v-4.5h2.3V15.4z M13.6,19.8h-2.3v-2.2h2.3V19.8z M0,23.2h25L12.5,2L0,23.2z" /></svg>
      <div class="hmcts-banner__message">
          <span class="hmcts-banner__assistive">{{type}}</span>
          {{message}}
      </div>
  </div>
  `
})
export class HmctsBannerComponent {
  constructor() { }
  @Input() type: string
  @Input() message: string;
}
