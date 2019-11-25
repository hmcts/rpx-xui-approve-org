import {Component, OnInit} from '@angular/core';
import * as fromStore from '../../store';
import { Store, select } from '@ngrx/store';
import { OrganisationVM} from 'src/org-manager/models/organisation';
import { Observable } from 'rxjs';


/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-org-details',
  templateUrl: './change-details.component.html'
})
export class ChangeDetailsComponent implements OnInit {

  public orgs$: Observable<OrganisationVM>;
  public dxNumber: string;
  public dxExchange: string;

  constructor(private store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {}

}
