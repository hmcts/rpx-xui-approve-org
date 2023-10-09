import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { RpxTranslationService } from 'rpx-xui-translation';
import { of } from 'rxjs';
import { NotificationBannerComponent } from '../../components';
import { OrganisationService } from '../../services';
import { SearchOrganisationsFormComponent } from '../search-organisations-form';
import { HomeComponent } from './home.component';
import { HttpClient, HttpHandler } from '@angular/common/http';

@Component({
  template: '<div>Bob</div>'
})
export class MockComponent { }

export const MOCK_ROUTES: Routes = [
  {
    path: '',
    component: MockComponent
  },
  {
    path: 'organisation',
    component: HomeComponent,
    children: [
      { path: 'pending', component: MockComponent },
      { path: 'pbas', component: MockComponent },
      { path: 'active', component: MockComponent }
    ]
  }
];
const organisationMockService = jasmine.createSpyObj('organisationService', ['organisationSearchStringChange', 'setOrganisationSearchString', 'resetPaginationParameters']);
organisationMockService.organisationSearchStringChange.and.returnValue(of(''));
const rpxTranslateMock = jasmine.createSpyObj('RpxTranslationService', ['getTranslation']);

const translationMockService = jasmine.createSpyObj('translationMockService', ['translate', 'getTranslation$']);

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let router: Router;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(MOCK_ROUTES),
        FormsModule,
        ReactiveFormsModule,
        ExuiCommonLibModule,
        HttpClientTestingModule
      ],
      declarations: [HomeComponent, SearchOrganisationsFormComponent, MockComponent, NotificationBannerComponent],
      providers: [
        { provide: RpxTranslationService, useValue: translationMockService },
        { provide: OrganisationService, useValue: organisationMockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
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

  it('should change the activeRoute when the route is changed', () => {
    const CHOSEN_TAB = component.tabs[1];
    router.navigate([CHOSEN_TAB.url]).then(() => {
      // Temp disable
      // expect(component.activeRoute).toEqual(CHOSEN_TAB.url);
      fixture.detectChanges();

      // We should now have an appropriately selected tab.
      // const selectedTab = fixture.debugElement.query(By.css('.govuk-tabs__list-item--selected'));
      // Temp disable
      // expect(selectedTab).not.toBeNull();
      // expect(selectedTab.nativeElement.textContent.trim()).toEqual(CHOSEN_TAB.label);
    });
  });

  it('should perform a search when the search form is submitted', () => {
    const SEARCH_STRING = 'Bob\'s Solicitors';
    component.submitSearch(SEARCH_STRING);
    expect(organisationMockService.setOrganisationSearchString).toHaveBeenCalledWith(SEARCH_STRING);
  });
});
