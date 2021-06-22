import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { OrganisationsHomeComponent } from './organisations-home.component';

@Component({
  template: `<div>Bob</div>`
})
export class MockComponent {}

export const MOCK_ROUTES: Routes = [
  {
    path: '',
    component: MockComponent
  },
  {
    path: 'organisation',
    component: OrganisationsHomeComponent,
    children: [
      { path: 'pending', component: MockComponent },
      { path: 'pbas', component: MockComponent },
      { path: 'active', component: MockComponent }
    ]
  }
];

describe('OrganisationsHomeComponent', () => {

  let fixture: ComponentFixture<OrganisationsHomeComponent>;
  let component: OrganisationsHomeComponent;
  let router: Router;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule.withRoutes(MOCK_ROUTES) ],
      declarations: [ OrganisationsHomeComponent, MockComponent ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganisationsHomeComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);

    fixture.detectChanges();
  }));

  it('should initialise appropriately', () => {
    // Should have an appropriate title.
    const title = fixture.debugElement.query(By.css('h1'));
    expect(title.nativeElement).toBeDefined();
    expect(title.nativeElement.textContent).toBeDefined();
    expect(title.nativeElement.textContent.trim()).toEqual('Organisation approvals');

    // Should have tabs displayed.
    const tabs = fixture.debugElement.query(By.css('.govuk-tabs__list'));
    expect(tabs.nativeElement).toBeDefined();
    expect(tabs.children.length).toEqual(component.tabs.length);
    expect(tabs.children[0].nativeElement.textContent.trim()).toEqual(component.tabs[0].label);
    expect(tabs.children[1].nativeElement.textContent.trim()).toEqual(component.tabs[1].label);
    expect(tabs.children[2].nativeElement.textContent.trim()).toEqual(component.tabs[2].label);

    // None of the tabs should be selected because the activeRoute does not match any of them.
    const selectedTab = fixture.debugElement.query(By.css('.govuk-tabs__list-item--selected'));
    expect(selectedTab).toBeNull();

    expect(component.activeRoute).toEqual('/');
  });

  it('should change the activeRoute when the route is changed', fakeAsync(() => {
    const CHOSEN_TAB = component.tabs[1];
    router.navigate([CHOSEN_TAB.url]).then(() => {
      expect(component.activeRoute).toEqual(CHOSEN_TAB.url);
      fixture.detectChanges();

      // We should now have an appropriately selected tab.
      const selectedTab = fixture.debugElement.query(By.css('.govuk-tabs__list-item--selected'));
      expect(selectedTab).not.toBeNull();
      expect(selectedTab.nativeElement.textContent.trim()).toEqual(CHOSEN_TAB.label);
    });
  }));

});
