import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../../base';

export class OrganisationApprovalsPage extends BasePage {
  private static readonly invalidPbaMessage = 'PBA numbers must start with PBA/pba and be followed by 7 alphanumeric characters';

  constructor(page: Page) {
    super(page);
  }

  readonly heading = this.page.getByRole('heading', { name: 'Organisation approvals' });
  readonly tabPanel = this.page.getByRole('tabpanel');
  readonly pendingOverviewPanel = this.page.locator('app-pending-overview-component');
  readonly tabCollection = this.page.locator('.govuk-tabs');
  readonly newPbasTab = this.tabCollection.getByRole('tab', { name: 'New PBAs' });
  readonly pendingPbasPanel = this.page.locator('app-pending-pbas');
  readonly pendingPbasTable = this.pendingPbasPanel.locator('table.govuk-table');
  readonly pendingPbasRows = this.pendingPbasTable.locator('tbody tr');
  readonly pendingPbasEmptyState = this.pendingPbasPanel.getByText('There are no new PBA requests.');
  readonly activeOrganisationsTab = this.tabCollection.getByRole('tab', { name: 'Active organisations' });
  readonly activeOrganisationsPanel = this.page.locator('app-prd-org-overview-component');
  readonly approveNewPbaHeading = this.page.getByRole('heading', { name: 'Approve new PBA number' });
  readonly approveAccountRadio = this.page.locator('input[id$="_approve"]');
  readonly confirmDecisionHeading = this.page.getByRole('heading', { name: 'Confirm your decision' });
  readonly continueButton = this.page.getByRole('button', { name: 'Continue' });
  readonly confirmButton = this.page.getByRole('button', { name: 'Confirm' });
  readonly validationSummary = this.page.locator('#errorSummary');

  async openNewPbasTab(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await this.newPbasTab.click();
    await this.waitForPendingPbasContent();
  }

  async openActiveOrganisationsTab(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await this.activeOrganisationsTab.click();
    await expect(this.activeOrganisationsPanel).toBeVisible();
  }

  async approveFirstInvalidPbaAndExpectValidationError(): Promise<void> {
    await this.openNewPbasTab();
    await this.viewFirstInvalidPbaRow();
    await this.approveAccount();
    await this.continueButton.click();
    await expect(this.confirmDecisionHeading).toBeVisible();
    await this.confirmButton.click();
    await this.expectValidationError();
  }

  private async viewFirstInvalidPbaRow(): Promise<void> {
    for (let pageIndex = 0; pageIndex < 100; pageIndex += 1) {
      await this.waitForPendingPbasContent();
      const invalidRow = await this.findInvalidRowOnCurrentPage();
      if (invalidRow) {
        await invalidRow.getByRole('link', { name: 'View' }).click();
        await expect(this.approveNewPbaHeading).toBeVisible();
        return;
      }

      const movedToNextPage = await this.goToNextPendingPbaPage();
      if (!movedToNextPage) {
        break;
      }
    }

    throw new Error('Unable to find a PBA row with an invalid PBA number.');
  }

  private async findInvalidRowOnCurrentPage(): Promise<Locator | null> {
    const rowCount = await this.pendingPbasRows.count();
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const row = this.pendingPbasRows.nth(rowIndex);
      const pbaCell = row.getByRole('cell').nth(1);
      const pbaNumbers = await this.getPendingPbaNumbers(pbaCell);

      if (pbaNumbers.some((pbaNumber) => !pbaNumber.toLowerCase().startsWith('pba'))) {
        return row;
      }
    }

    return null;
  }

  private async goToNextPendingPbaPage(): Promise<boolean> {
    const nextPageLink = this.page.getByRole('link', { name: 'Next page' });
    if (!(await nextPageLink.count())) {
      return false;
    }

    const isVisible = await nextPageLink.first().isVisible().catch(() => false);
    if (!isVisible) {
      return false;
    }

    const firstRowText = await this.pendingPbasRows.first().innerText().catch(() => '');
    await nextPageLink.first().click();
    await this.waitForPendingPbasContent();

    if (firstRowText) {
      await expect(this.pendingPbasRows.first()).not.toHaveText(firstRowText, { timeout: 15_000 });
    }

    return true;
  }

  private async approveAccount(): Promise<void> {
    const approveAccountRadios = this.approveAccountRadio;
    await expect(approveAccountRadios.first()).toBeVisible({ timeout: 30_000 });
    const approveAccountCount = await approveAccountRadios.count();

    expect(approveAccountCount).toBeGreaterThan(0);

    for (let index = 0; index < approveAccountCount; index += 1) {
      const approveAccountRadio = approveAccountRadios.nth(index);
      await expect(approveAccountRadio).toBeVisible();
      await approveAccountRadio.check();
    }
  }

  private async expectValidationError(): Promise<void> {
    await expect(this.validationSummary).toBeVisible();
    await expect(this.validationSummary).toContainText('There is a problem');
    await expect(this.validationSummary).toContainText(OrganisationApprovalsPage.invalidPbaMessage);
  }

  private async waitForPendingPbasContent(): Promise<void> {
    await expect(this.pendingPbasPanel).toBeVisible();
    await expect(this.page.getByText('Loading')).toBeHidden({ timeout: 30_000 }).catch(() => undefined);
    await expect(this.pendingPbasRows.first().or(this.pendingPbasEmptyState)).toBeVisible({ timeout: 30_000 });
  }

  private async getPendingPbaNumbers(pbaCell: Locator): Promise<string[]> {
    const pbaValueDivs = pbaCell.locator('div');
    const pbaValueTexts = await pbaValueDivs.allTextContents();
    if (pbaValueTexts.length > 0) {
      return pbaValueTexts.map((text) => text.trim()).filter(Boolean);
    }

    return (await pbaCell.innerText())
      .split(/\r?\n/)
      .map((text) => text.trim())
      .filter(Boolean);
  }
}
