import {Component, OnInit} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {filter, take, takeWhile} from 'rxjs/operators';
import { OrganisationVM} from 'src/org-manager/models/organisation';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store';
import * as fromOrganisation from '../../store';

/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-org-users',
  templateUrl: './organisation-users.component.html'
})
export class OrganisationUsersComponent implements OnInit {
  constructor(
    private readonly store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {
  }

}

