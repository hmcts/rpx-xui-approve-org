import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store';
import { UserDetailsComponent } from './user-details.component';

describe('UserDetailsComponent Component', () => {

    let fixture: ComponentFixture<UserDetailsComponent>;
    let component: UserDetailsComponent;
    let store: Store<fromStore.OrganisationRootState>;

    beforeEach((() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                StoreModule.forRoot({
                    ...fromRoot.reducers,
                    feature: combineReducers(fromStore.reducers),
                }),
            ],
            schemas: [
              CUSTOM_ELEMENTS_SCHEMA
            ],
            declarations: [
              UserDetailsComponent
            ]
        }).compileComponents();

        store = TestBed.get(Store);

        fixture = TestBed.createComponent(UserDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    // it('should have a component', () => {
    //     expect(component).toBeTruthy();
    // });
});
