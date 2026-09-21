import { Component, Input } from '@angular/core';

/*
* Gov UK Label component
* Responsible for displaying label tag
* @prop isPageHeading - boolean to display h1
* @prop config - obj with properties
* */
@Component({
  selector: 'lib-gov-label',
  template: `<h1 *ngIf="config.isPageHeading else noHeading">
          <label *ngIf="config.label" [class]="config.classes + ' govuk-label'"
                 [for]="config.id">
            {{ config.label }}
          </label>
        </h1>
        <ng-template #noHeading>
          <label *ngIf="config.label" [class]="config.classes + ' govuk-label'"
                 [for]="config.id">
            {{ config.label }}
          </label>
        </ng-template>
  `
})
export class GovUkLabelComponent {
  @Input() config: { label: string, name: string; id: string, isPageHeading: boolean, classes: string } = { label: '', name: '', id: '', isPageHeading: false, classes: '' };

  constructor () {}
}
