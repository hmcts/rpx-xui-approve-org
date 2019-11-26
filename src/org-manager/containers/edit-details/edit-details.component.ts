import {Component, OnInit} from '@angular/core';
import * as fromStore from '../../store';
import { Store, select } from '@ngrx/store';
import { OrganisationVM} from 'src/org-manager/models/organisation';
import { Observable } from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';


/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-org-details',
  templateUrl: './edit-details.component.html'
})
export class EditDetailsComponent implements OnInit {

  public orgs$: Observable<OrganisationVM>;
  public dxNumber: string;
  public dxExchange: string;
  public changePba: FormGroup;


  constructor(private store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {
    this.changePba = new FormGroup({
      pba1: new FormControl('', Validators.required),
      pba2: new FormControl('',)
    })
  }

  public onSubmitPba(): void {
  }

}
