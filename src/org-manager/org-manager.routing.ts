import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { ActiveOrganisationsComponent } from './containers';
import { PendingOrganisationsComponent} from 'src/org-manager/containers/pending-organisations/pending-organisations.component';
import { ApproveOrganisationComponent } from 'src/org-manager/containers/approve-organisation/approve-organisation.component';
import { ApproveOrganisationSuccessComponent } from 'src/org-manager/containers/approve-organisation-success/approve-organisation-success.component';
import { AuthGuard } from 'src/services/auth/auth.guard';
import { OrganisationDetailsComponent } from './components';

export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'active-organisation',
    pathMatch: 'full',
  },
  {
    path: 'active-organisation',
    component: ActiveOrganisationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'pending-organisations',
    component: PendingOrganisationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'approve-organisations',
    component: ApproveOrganisationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'approve-organisations-success',
    component: ApproveOrganisationSuccessComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organisation-details/:type/:id',
    component: OrganisationDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'change/:fields/:id',
    component: OrganisationDetailsComponent,
    canActivate: [AuthGuard],
  },
];

export const orgManagerRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
