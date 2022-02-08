import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OrganisationVM } from 'src/org-manager/models/organisation';

@Component({
  selector: 'app-new-pbas-info',
  templateUrl: './new-pbas-info.component.html'
})
export class NewPBAsInfoComponent {

  @Input() public org: OrganisationVM;
  @Input() public newPBAs: Map<string, string>;
  @Output() public submitForm = new EventEmitter();
  @Output() public newPBA = new EventEmitter<{ name: string, value: string }>();

  constructor() {

  }

  public onSubmitForm(): void {
    this.submitForm.emit();
  }

  public setNewPBA($event): void {
    this.newPBA.emit({ name: $event.name, value: $event.value });
  }
}
