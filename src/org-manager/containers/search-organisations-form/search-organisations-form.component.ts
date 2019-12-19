import {Component,  EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-search-organisations-form',
  templateUrl: './search-organisations-form.component.html',
  styleUrls: ['./search-organisations-form.component.scss']
})
export class SearchOrganisationsFormComponent implements OnInit {
  @Output() public submitForm = new EventEmitter();
  public searchOrgForm: FormGroup;

  public ngOnInit(): void {
    this.searchOrgForm = new FormGroup({
      search: new FormControl('', Validators.required)
    });
  }

  public onSubmit() {
    if (this.searchOrgForm.valid) {
      this.submitForm.emit(this.searchOrgForm.controls.search.value);
    }
  }
}
