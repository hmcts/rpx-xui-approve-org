import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { NavigationItem, Navigations, ServiceName } from 'src/shared/types';
import * as fromRoot from '../../store';

@Component({
    selector: 'app-hmcts-global-header',
    templateUrl: './hmcts-global-header.component.html'
})
export class HmctsGlobalHeaderComponent {

    @Input()
    public set userLoggedIn(value: boolean) {
        this.userLoggedInFlag = value;
    }
    public get userLoggedIn(): boolean {
        return this.userLoggedInFlag;
    }

    @Input() public serviceName: ServiceName;
    @Input() public navigation: Navigations;
    @Output() public navigate = new EventEmitter<string>();

    private userLoggedInFlag: boolean;

    constructor(public store: Store<fromRoot.State>) { }

    public onEmitEvent(index: number): void {
        this.navigate.emit(this.navigation.items[index].emit);
    }

    public shouldShowLogout(item: NavigationItem): boolean {
        return this.userLoggedIn || (item.text === 'Sign out');
    }
}
