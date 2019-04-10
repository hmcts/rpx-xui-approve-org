// routes
import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { UsersComponent } from './containers';
import { UserFormComponent } from './containers/userform/user-form.component';

export const ROUTES: Routes = [
    {
      path: '',
      component: UsersComponent,
      canActivate: [],
    },
    {
      path: 'invite-user',
      component: UserFormComponent,
      canActivate: [],
    }
];


export const usersRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
