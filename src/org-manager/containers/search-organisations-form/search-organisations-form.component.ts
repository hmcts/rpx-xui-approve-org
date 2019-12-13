import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators, FormArray} from '@angular/forms';

@Component({
  selector: 'app-search-organisations-form',
  templateUrl: './search-organisations-form.component.html',
})
export class SearchOrganisationsFormComponent implements OnInit {
  @Output() submitForm = new EventEmitter();
  public searchOrgForm: FormGroup;

  public fieldError = {isInvalid: false, message: ''};

  public checkboxFields = [
    { id: 'org-name', label: 'Organisation Name'},
    { id: 'org-postcode', label: 'Organisation Postcode'},
    { id: 'pba-number', label: 'PBA Number'},
    { id: 'sra-number', label: 'SRA Number'},
    { id: 'dx-number', label: 'DX Number'},
    { id: 'dx-exchange', label: 'DX Exchange'},
  ];

  ngOnInit(): void {
    const fieldForms = {};
    this.checkboxFields.forEach( field => {
      fieldForms[field.id] = new FormControl(true);
    });
    this.searchOrgForm = new FormGroup({
      search: new FormControl('', Validators.required),
      fields: new FormGroup(fieldForms, Validators.required)
    });
  }

  isCheckboxesValid(): boolean {
    for (const checkbox of this.checkboxFields) {
      if (this.searchOrgForm.controls.fields.value[checkbox.id]) {
        this.fieldError = {isInvalid: false, message: ''};
        return true;
      }
    }
    this.fieldError = {isInvalid: true, message: 'You should at least select one option'};
    return false;
  }

  onSubmit() {
    console.log(this.searchOrgForm);
    if (!this.searchOrgForm.invalid) {
      if (this.isCheckboxesValid()) {
        this.submitForm.emit({searchString: this.searchOrgForm.controls.search.value, searchFields: this.searchOrgForm.controls.fields.value});
      }
    } else {
      console.log('search org form invalid');
    }
  }
}
