import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import { Subscription } from 'rxjs';
import { OrganisationVM } from '../../models/organisation';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-new-pbas-info',
  templateUrl: './new-pbas-info.component.html'
})
export class NewPBAsInfoComponent implements OnInit, OnDestroy {

  @Input() public org: OrganisationVM;
  @Input() public newPBAs: Map<string, string>;
  @Output() public submitForm = new EventEmitter();
  @Output() public newPBA = new EventEmitter<{ name: string, value: string }>();
  @Input() public formGroup: any;
  public submitted = false;
  public formSub: Subscription;
  constructor(private readonly fb: FormBuilder) {

  }

  public ngOnInit(): void {
    this.formGroup = this.fb.group({});
    this.org.pendingPaymentAccount.forEach(p => this.formGroup.addControl(p, this.fb.control('' , null)));
    this.formSub = this.formGroup.valueChanges.subscribe(() => this.submitted = false);
  }

  public ngOnDestroy(): void {
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }

  public onSubmitForm(): void {
    this.submitted = true;
    if (this.formGroup.valid) {
        this.submitForm.emit();
    }
  }

  public setNewPBA($event): void {
    this.newPBA.emit({ name: $event.name, value: $event.value });
  }
}
