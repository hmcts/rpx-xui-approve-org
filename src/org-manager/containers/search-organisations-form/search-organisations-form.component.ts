import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-organisations-form',
  templateUrl: './search-organisations-form.component.html',
  styleUrls: ['./search-organisations-form.component.scss']
})
export class SearchOrganisationsFormComponent implements OnInit {
  @Input() public searchString: string;
  @Output() public submitForm = new EventEmitter();
  public searchOrgForm: FormGroup;

  public ngOnInit(): void {
    this.searchOrgForm = new FormGroup({
      search: new FormControl(this.searchString)
    });
  }

  public onSubmit(): void {
    if (this.searchOrgForm.valid) {
      this.submitForm.emit(this.searchOrgForm.controls.search.value);
    }
  }

  public onReset(): void {
    this.searchOrgForm.controls.search.setValue('');
    this.onSubmit();
  }
}
