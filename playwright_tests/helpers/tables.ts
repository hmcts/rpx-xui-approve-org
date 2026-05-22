export function getTableDataByXpath(page: any, xpath: string) {
  return page.locator(xpath).innerText();
}

export function getSummaryListValueByKey(page: any, rootSelector: string, key: string) {
  return page
    .locator(`${rootSelector} .govuk-summary-list__row`)
    .filter({ has: page.locator('dt.govuk-summary-list__key', { hasText: key }) })
    .locator('dd.govuk-summary-list__value')
    .first()
    .innerText();
}

export function getTableActionButton(page: any, xpath: string) {
  return page.locator(xpath);
}

export async function verifyTableHasRows(page: any, xpath: string) {
  const table = await page.locator(xpath);
  const rows = await table.locator('tbody tr');
  const rowCount = await rows.count();
  return rowCount > 0;
}
