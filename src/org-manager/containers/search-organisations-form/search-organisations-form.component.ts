import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SessionStorageService } from '../../../shared/services/session-storage.service';
import { OrganisationService } from '../../services';

@Component({
  selector: 'app-search-organisations-form',
  templateUrl: './search-organisations-form.component.html',
  styleUrls: ['./search-organisations-form.component.scss']
})
export class SearchOrganisationsFormComponent implements OnInit, OnDestroy {
  @Input() public searchString: string;
  @Output() public submitForm = new EventEmitter();
  private subscription: Subscription;
  public searchOrgForm: UntypedFormGroup;
  constructor(
    protected organisationService: OrganisationService,
    private readonly sessionStorageService: SessionStorageService
  ) {}

  public ngOnInit(): void {
    this.searchOrgForm = new UntypedFormGroup({
      search: new UntypedFormControl(this.searchString)
    });

    this.subscription = this.organisationService.organisationSearchStringChange().subscribe(
      (searchString) => {
        this.searchOrgForm.controls.search.setValue(searchString);
      }
    );
  }

  public onSubmit(): void {
    if (this.searchOrgForm.valid) {
      this.submitForm.emit(this.searchOrgForm.controls.search.value);
    }
  }

  public onSearchChange(): void {
    if (this.searchOrgForm.valid) {
      this.sessionStorageService.setItem('searchString', this.searchOrgForm.controls.search.value);
    }
  }

  public onReset(): void {
    this.searchOrgForm.controls.search.setValue('');
    this.onSubmit();
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
