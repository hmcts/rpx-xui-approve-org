// import { TestBed, async, ComponentFixture } from '@angular/core/testing';
// import { EditDetailsComponent } from './edit-details.component';
// import { RouterTestingModule } from '@angular/router/testing';
// import * as fromEditDetailsReducer from '../../../org-manager/store/reducers/edit-details.reducer';
// import * as fromRoot from '../../../app/store/reducers';
// import { StoreModule, Store, combineReducers } from '@ngrx/store';
// import { BackLinkComponent } from 'src/org-manager/components';
// import {IdentityBarComponent} from '../../../shared/components/identity-bar/identity-bar.component';
// import {GovUkMainWrapperComponent} from '../../../../projects/gov-ui/src/lib/components/gov-uk-main-wrapper/gov-uk-main-wrapper.component';
// import {GovUkInputComponent} from '../../../../projects/gov-ui/src/lib/components/gov-uk-input/gov-uk-input.component';
// import {ReactiveFormsModule} from '@angular/forms';
//
// fdescribe('Edit Details Component', () => {
//   let component: EditDetailsComponent;
//   let fixture: ComponentFixture<EditDetailsComponent>;
//   let store: Store<fromEditDetailsReducer.EditDetailsState>;
//   let storePipeMock: any;
//   let storeDispatchMock: any;
//
//   beforeEach((() => {
//     TestBed.configureTestingModule({
//       imports: [
//         RouterTestingModule,
//         ReactiveFormsModule,
//         StoreModule.forRoot({
//           ...fromRoot.reducers,
//           feature: combineReducers(fromEditDetailsReducer.reducer),
//         }),
//       ],
//       declarations: [
//         BackLinkComponent,
//         EditDetailsComponent,
//         IdentityBarComponent,
//         GovUkMainWrapperComponent,
//         GovUkInputComponent
//       ]
//     }).compileComponents();
//     store = TestBed.get(Store);
//
//     storePipeMock = spyOn(store, 'pipe');
//     storeDispatchMock = spyOn(store, 'dispatch');
//
//     fixture = TestBed.createComponent(EditDetailsComponent);
//     component = fixture.componentInstance;
//   }));
//
//   it('should return reviewed organisations', () => {
//     fixture.detectChanges();
//     expect(component).toBeTruthy();
//   });
//
// });
