import {Component, Input, OnInit} from '@angular/core';
import {Location} from '@angular/common';

/*
* Main Content wrapper
* Responsible for:
 * Wrapping content within the gov-uk html elements bellow
 * @prop showBackLink - switch for back linnk
 * @prop title = title
 * @prop summaryErrors list of errors
* @prop back link, title (title), summaryErrors (array of errors)
* */

@Component({
  selector: 'lib-gov-uk-main-wrapper',
  template: `
    <a *ngIf="backLink" [routerLink]="" (click)="onGoBack()" class="govuk-back-link">Back</a>
    <main id="content" role="main" class="govuk-main-wrapper">
      <app-hmcts-error-summary
        *ngIf="errors && !errors.isFormValid"
        [errorMessages]="errors.items"
        [header]="errors.header">
      </app-hmcts-error-summary>
        <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
        <lib-banner *ngIf="bannerData" [message]="bannerData.message" [type]="bannerData.type"></lib-banner>
          <h1 *ngIf="title" class="govuk-heading-xl">{{title}}</h1>
          <ng-content></ng-content>
        </div>
      </div>
    </main>
  `
})
export class GovUkMainWrapperComponent {
  public errors:{isFormValid: boolean; items: { id: string; message: any; }[]};
  public bannerData:{type: string; message: string}
  @Input() public backLink: string;
  @Input() public title: string;
  @Input() public set banner(value) {
    this.bannerData = value;
  };
  @Input() public set summaryErrors(value) {
    this.errors = value;
  };

  constructor( private location: Location) { }
  public onGoBack() {
    this.location.back();
  }

}
