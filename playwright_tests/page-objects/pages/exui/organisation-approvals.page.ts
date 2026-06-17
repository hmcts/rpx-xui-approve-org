import type { Locator, Page } from '@playwright/test';
import { ExuiSpinnerComponent, WaitUtils } from '@hmcts/playwright-common';
import { BasePage } from '../../base';

export class OrganisationApprovalsPage extends BasePage {
  private readonly exuiSpinner: ExuiSpinnerComponent;
  private readonly waitUtils: WaitUtils;

  constructor(page: Page) {
    super(page);
    this.exuiSpinner = new ExuiSpinnerComponent(page);
    this.waitUtils = new WaitUtils();
  }

  readonly heading = this.page.locator('main#main-content h1.hmcts-page-heading__title');
  readonly contentMain = this.page.locator('main#content');
  readonly tabPanel = this.page.locator('.govuk-tabs > .govuk-tabs__panel[role="tabpanel"]');
  readonly pendingOverviewPanel = this.page.locator('app-pending-overview-component');
  readonly pendingOrganisationRows = this.pendingOverviewPanel.locator('table.pending-organisations tr');
  readonly searchInput = this.page.locator('#search');
  readonly searchButton = this.page.locator('.search-organisations-form form button.hmcts-search__button:not(.govuk-button--secondary)');
  readonly detailsPanel = this.page.locator('app-org-details-info, app-org-details-info-old');
  readonly approveOrganisationHeading = this.detailsPanel.locator('h1.govuk-heading-xl');
  readonly confirmDecisionHeading = this.contentMain.getByRole('heading', { level: 1, name: /Confirm your decision/i });
  readonly confirmButton = this.contentMain.getByRole('button', { name: /Confirm/i }).first();
  readonly submitButton = this.detailsPanel.locator('button[type="submit"].govuk-button').first();
  readonly approveDecisionRadio = this.page.locator('#reason-0');
  readonly rejectDecisionRadio = this.page.locator('#reason-1');
  readonly reviewDecisionRadio = this.page.locator('#reason-2');
  readonly deleteOrganisationDetailsButton = this.detailsPanel.locator('button.govuk-button--secondary').first();
  readonly deleteOrganisationConfirmButton = this.contentMain.locator('button.govuk-button--warning').first();
  readonly goBackToActiveLink = this.contentMain.locator('a[href*="/active-organisation"]');
  readonly deleteWarningText = this.contentMain.locator('.govuk-warning-text__text');
  readonly whatHappensNextHeading = this.contentMain.locator('h2.govuk-heading-m');
  readonly tellOrganisationText = this.contentMain.locator('p.govuk-body').nth(0);
  readonly usersRemovedText = this.contentMain.locator('p.govuk-body').nth(1);
  readonly tabCollection = this.page.locator('.govuk-tabs');
  readonly pendingOrganisationsTab = this.tabCollection.locator('a.govuk-tabs__tab[href*="/organisation/pending"]');
  readonly newPbasTab = this.tabCollection.locator('a.govuk-tabs__tab[href*="/organisation/pbas"]');
  readonly pendingPbasPanel = this.page.locator('app-pending-pbas');
  readonly pendingPbaViewLinkLocator = this.pendingPbasPanel.locator('table.govuk-table a.govuk-link[href*="/new/"]').first();
  readonly pendingPbaDecisionRows = this.page.locator('app-pba-account-approval');
  readonly pendingPbaContinueButton = this.page.locator('app-new-pbas-info button[type="submit"].govuk-button').first();
  readonly newPbaDetailsPageHeading = this.page.locator('app-new-pbas-info h1.govuk-heading-xl').first();
  readonly newPbaAccountsHeading = this.page.locator('app-new-pbas-info h3.govuk-heading-m#heading').first();
  readonly activeOrganisationsTab = this.tabCollection.locator('a.govuk-tabs__tab[href*="/organisation/active"]');
  readonly activeOrganisationsPanel = this.page.locator('app-prd-org-overview-component');
  readonly staffDetailsHeaderTabLocator = this.page.locator('a[href*="/caseworker-details"]').first();
  readonly staffDetailsPageHeading = this.page.locator('app-prd-caseworker-details .govuk-heading-l');
  readonly activeOrganisationRows = this.activeOrganisationsPanel.locator('table.active-organisations tr');
  readonly subNavigation = this.page.locator('nav.hmcts-sub-navigation');
  readonly usersTabLink = this.subNavigation.locator('li.hmcts-sub-navigation__item').nth(1).locator('a.hmcts-sub-navigation__link');
  readonly usersList = this.page.locator('xuilib-user-list');
  readonly userUploadSurfaceLocator = this.page
    .locator('input[type="file"], xuilib-user-list, app-org-details-info, app-org-details-info-old')
    .first();

  readonly usersTableRows = this.usersList.locator('table tbody tr');
  readonly adminDetailsHeading = this.detailsPanel.locator('h3.govuk-heading-m').nth(1);
  readonly pendingOrganisationViewLinkLocator = this.pendingOverviewPanel
    .locator('table.pending-organisations a.govuk-link[href*="/organisation-details/"]')
    .first();

  readonly pendingPbaRows = this.pendingPbasPanel.locator('table.govuk-table tbody tr');

  readonly activeOrganisationViewLinkLocator = this.activeOrganisationsPanel
    .locator('table.active-organisations a.govuk-link[href*="/organisation-details/"]')
    .first();

  readonly notificationBannerMessage = this.page.locator('app-notification-banner-component .hmcts-banner__message');
  readonly deletedOrganisationBannerTitle = this.contentMain.locator('.govuk-panel--confirmation .govuk-panel__title');
  readonly pagination = this.page.locator('xuilib-hmcts-pagination');
  readonly pendingOrganisationEmptyState = this.page.getByText('There are no new registrations.');
  readonly pendingPbaEmptyState = this.page.getByText('There are no new PBA requests.');
  readonly organisationNameSummaryValue = this.detailsPanel
    .locator('.govuk-summary-list__row .govuk-summary-list__value')
    .first();

  pendingOrganisationViewLink(): Locator {
    return this.pendingOrganisationViewLinkLocator;
  }

  pendingPbaViewLink(): Locator {
    return this.pendingPbaViewLinkLocator;
  }

  staffDetailsHeaderTab(): Locator {
    return this.staffDetailsHeaderTabLocator;
  }

  pendingOrganisationRowsByName(organisationName: string): Locator {
    return this.pendingOrganisationRows.filter({ hasText: organisationName });
  }

  pendingOrganisationRowByName(organisationName: string): Locator {
    return this.pendingOrganisationRowsByName(organisationName).first();
  }

  activeOrganisationRowsByText(searchText: string): Locator {
    return this.activeOrganisationRows.filter({ hasText: searchText });
  }

  activeOrganisationRowByText(searchText: string): Locator {
    return this.activeOrganisationRowsByText(searchText).first();
  }

  activeOrganisationViewLink(): Locator {
    return this.activeOrganisationViewLinkLocator;
  }

  pendingPbaRowsByText(searchText: string): Locator {
    return this.pendingPbaRows.filter({ hasText: searchText });
  }

  pendingPbaRowByText(searchText: string): Locator {
    return this.pendingPbaRowsByText(searchText).first();
  }

  successBanner(messageText: RegExp | string): Locator {
    return this.notificationBannerMessage.filter({ hasText: messageText }).first();
  }

  deletedOrganisationBanner(organisationName: string): Locator {
    return this.deletedOrganisationBannerTitle.filter({ hasText: organisationName }).first();
  }

  organisationDetailsPbaRow(pbaNumber: string): Locator {
    return this.detailsPanel
      .locator('.govuk-summary-list__row')
      .filter({ hasText: 'PBA number' })
      .filter({ hasText: pbaNumber })
      .first();
  }

  async searchForOrganisation(organisationName: string): Promise<void> {
    await this.searchInput.fill(organisationName);
    await this.searchButton.click();
  }

  async openPaginationPage(pageNumber: number): Promise<void> {
    await this.pagination.waitFor({ state: 'visible' });

    const pageNumberText = String(pageNumber);
    const linkCandidate = this.pagination.getByRole('link', { name: pageNumberText }).first();
    if (await linkCandidate.count()) {
      await linkCandidate.click();
      return;
    }

    const buttonCandidate = this.pagination.getByRole('button', { name: pageNumberText }).first();
    if (await buttonCandidate.count()) {
      await buttonCandidate.click();
      return;
    }

    await this.pagination.locator('a, button').filter({ hasText: pageNumberText }).first().click();
  }

  async openFirstPendingOrganisation(): Promise<void> {
    await this.pendingOrganisationViewLink().click();
  }

  async clickBackLink(): Promise<void> {
    const roleBackLink = this.page.getByRole('link', { name: /^Back$/ }).first();
    if (await roleBackLink.count()) {
      await roleBackLink.click();
      return;
    }

    await this.page.locator('a', { hasText: /^Back$/ }).first().click();
  }

  async openFirstActiveOrganisation(): Promise<void> {
    await this.activeOrganisationViewLink().click();
  }

  async openFirstPendingPba(): Promise<void> {
    await this.pendingPbaViewLink().click();
  }

  async approveAllPendingPbas(): Promise<void> {
    await this.pendingPbaDecisionRows.first().waitFor({ state: 'visible', timeout: 60_000 });
    const pendingPbaCount = await this.pendingPbaDecisionRows.count();

    for (let index = 0; index < pendingPbaCount; index += 1) {
      await this.pendingPbaDecisionRows
        .nth(index)
        .locator('input.govuk-radios__input')
        .first()
        .check({ force: true });
    }
  }

  async continuePendingPbaDecision(): Promise<void> {
    await this.pendingPbaContinueButton.click();
  }

  async openStaffDetailsTab(): Promise<void> {
    await this.staffDetailsHeaderTab().click();
  }

  private async checkDecisionRadio(decisionRadio: Locator, decisionName: string): Promise<void> {
    await decisionRadio.check({ trial: true });
    await decisionRadio.check();

    if (!(await decisionRadio.isChecked())) {
      throw new Error(`Unable to select decision radio: ${decisionName}`);
    }
  }

  async chooseDecision(decisionLabel: string | RegExp): Promise<void> {
    const normalizedDecision = (typeof decisionLabel === 'string' ? decisionLabel : decisionLabel.source).toLowerCase();

    if (normalizedDecision.includes('approve')) {
      await this.checkDecisionRadio(this.approveDecisionRadio, 'approve');
      return;
    }

    if (normalizedDecision.includes('reject')) {
      await this.checkDecisionRadio(this.rejectDecisionRadio, 'reject');
      return;
    }

    if (normalizedDecision.includes('review') || normalizedDecision.includes('hold')) {
      await this.checkDecisionRadio(this.reviewDecisionRadio, 'review');
      return;
    }

    throw new Error(`Unsupported decision label: ${String(decisionLabel)}`);
  }

  async submitDecision(): Promise<void> {
    await this.submitButton.click();
  }

  async confirmDecision(): Promise<void> {
    await this.confirmButton.click();
  }

  async waitForSpinnerToHide(timeoutMs = 15_000): Promise<void> {
    await this.waitUtils.waitForLocatorVisibility(this.exuiSpinner.spinner, {
      visibility: false,
      timeout: timeoutMs
    });
  }

  async getOrganisationNameFromDetails(): Promise<string> {
    const organisationName = await this.organisationNameSummaryValue.innerText();

    return organisationName.trim();
  }

  async deleteActiveOrganisation(): Promise<void> {
    const detailsDeleteButtonVisible = await this.deleteOrganisationDetailsButton.isVisible().catch(() => false);
    if (detailsDeleteButtonVisible) {
      await this.deleteOrganisationDetailsButton.click();
      return;
    }

    await this.deleteOrganisationConfirmButton.click();
  }

  async openNewPbasTab(): Promise<void> {
    await this.newPbasTab.click();
  }

  async openPendingOrganisationsTab(): Promise<void> {
    await this.pendingOrganisationsTab.click();
  }

  async openActiveOrganisationsTab(): Promise<void> {
    await this.activeOrganisationsTab.click();
  }

  async openUsersTab(): Promise<void> {
    await this.usersTabLink.click();
  }
}
