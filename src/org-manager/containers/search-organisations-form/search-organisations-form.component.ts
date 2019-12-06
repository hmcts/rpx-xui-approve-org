import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';


@Component({
  selector: 'app-search-organisations-form',
  templateUrl: './search-organisations-form.component.html',
})
export class SearchOrganisationsFormComponent implements OnInit {
  @Output() submitForm = new EventEmitter();
  searchOrgForm: FormGroup;

  ngOnInit(): void {
    this.searchOrgForm = new FormGroup({
      search: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    if (!this.searchOrgForm.invalid) {
      this.submitForm.emit(this.searchOrgForm.controls.search.value);
    } else {
      console.log('search org form invalid');
    }
  }
}
