import { BasePage } from '../../base';

export class OrganisationApprovalsPage extends BasePage {
  readonly heading = this.page.getByRole('heading', { name: 'Organisation approvals' });
  readonly tabPanel = this.page.getByRole('tabpanel');
  readonly pendingOverviewPanel = this.page.locator('app-pending-overview-component');
  readonly tabCollection  = this.page.locator('.govuk-tabs');
  readonly newPbasTab = this.tabCollection.getByRole('tab', { name: 'New PBAs' });
  readonly pendingPbasPanel = this.page.locator('app-pending-pbas');
  readonly activeOrganisationsTab = this.tabCollection.getByRole('tab', { name: 'Active organisations' });
  readonly activeOrganisationsPanel = this.page.locator('app-prd-org-overview-component');

  async openNewPbasTab(): Promise<void> {
    await this.newPbasTab.click();
  }

  async openActiveOrganisationsTab(): Promise<void> {
    await this.activeOrganisationsTab.click();
  }
}
