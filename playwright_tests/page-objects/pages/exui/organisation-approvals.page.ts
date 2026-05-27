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
  readonly searchInput = this.page.locator('#search');
  readonly searchButton = this.page.locator('.search-organisations-form form button.hmcts-search__button:not(.govuk-button--secondary)');
  readonly detailsPanel = this.page.locator('app-org-details-info, app-org-details-info-old');
  readonly approveOrganisationHeading = this.page.locator('app-org-details-info h1.govuk-heading-xl, app-org-details-info-old h1.govuk-heading-xl');
  readonly confirmDecisionHeading = this.contentMain.locator('h1.govuk-heading-xl');
  readonly confirmButton = this.contentMain.locator('button.govuk-button:not(.govuk-button--warning)').first();
  readonly submitButton = this.page.locator('app-org-details-info button.govuk-button[type="submit"]:not(.govuk-button--secondary), app-org-details-info-old button.govuk-button[type="submit"]:not(.govuk-button--secondary)');
  readonly deleteOrganisationDetailsButton = this.page.locator('app-org-details-info button.govuk-button--secondary, app-org-details-info-old button.govuk-button--secondary').first();
  readonly deleteOrganisationConfirmButton = this.contentMain.locator('button.govuk-button--warning').first();
  readonly goBackToActiveLink = this.contentMain.locator('a[href*="/active-organisation"]');
  readonly deleteWarningText = this.contentMain.locator('.govuk-warning-text__text');
  readonly whatHappensNextHeading = this.contentMain.locator('h2.govuk-heading-m');
  readonly tellOrganisationText = this.contentMain.locator('p.govuk-body').nth(0);
  readonly usersRemovedText = this.contentMain.locator('p.govuk-body').nth(1);
  readonly tabCollection = this.page.locator('.govuk-tabs');
  readonly newPbasTab = this.tabCollection.locator('a.govuk-tabs__tab[href*="/organisation/pbas"]');
  readonly pendingPbasPanel = this.page.locator('app-pending-pbas');
  readonly activeOrganisationsTab = this.tabCollection.locator('a.govuk-tabs__tab[href*="/organisation/active"]');
  readonly activeOrganisationsPanel = this.page.locator('app-prd-org-overview-component');

  pendingOrganisationViewLink(): Locator {
    return this.pendingOverviewPanel
      .locator('table.pending-organisations a.govuk-link[href*="/organisation-details/"]')
      .first();
  }

  activeOrganisationViewLink(): Locator {
    return this.activeOrganisationsPanel
      .locator('table.active-organisations a.govuk-link[href*="/organisation-details/"]')
      .first();
  }

  successBanner(messageText: RegExp | string): Locator {
    return this.page.locator('app-notification-banner-component .hmcts-banner__message').filter({ hasText: messageText }).first();
  }

  deletedOrganisationBanner(organisationName: string): Locator {
    return this.contentMain.locator('.govuk-panel--confirmation .govuk-panel__title').filter({ hasText: organisationName }).first();
  }

  async searchForOrganisation(organisationName: string): Promise<void> {
    await this.searchInput.fill(organisationName);
    await this.searchButton.click();
  }

  async openFirstPendingOrganisation(): Promise<void> {
    await this.pendingOrganisationViewLink().click();
  }

  async openFirstActiveOrganisation(): Promise<void> {
    await this.activeOrganisationViewLink().click();
  }

  async chooseDecision(decisionLabel: string | RegExp): Promise<void> {
    const normalizedDecision = (typeof decisionLabel === 'string' ? decisionLabel : decisionLabel.source).toLowerCase();

    if (normalizedDecision.includes('approve')) {
      await this.page.locator('#reason-0').check();
      return;
    }

    if (normalizedDecision.includes('reject')) {
      await this.page.locator('#reason-1').check();
      return;
    }

    if (normalizedDecision.includes('review') || normalizedDecision.includes('hold')) {
      await this.page.locator('#reason-2').check();
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
    const organisationName = await this.page
      .locator('app-org-details-info .govuk-summary-list__row .govuk-summary-list__value, app-org-details-info-old .govuk-summary-list__row .govuk-summary-list__value')
      .first()
      .innerText();

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

  async openActiveOrganisationsTab(): Promise<void> {
    await this.activeOrganisationsTab.click();
  }
}