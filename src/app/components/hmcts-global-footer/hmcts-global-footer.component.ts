import { Component, Input } from '@angular/core';
import { Helper, Navigation } from '../../containers/footer/footer.model';

@Component({
    selector: 'app-hmcts-global-footer',
    templateUrl: './hmcts-global-footer.component.html'
})
export class HmctsGlobalFooterComponent {
    @Input() help: Helper;
    @Input() navigation: Navigation;

    constructor() { }

}
