export const PAGE_TITLE_SUFFIX = 'Approve Organisation - HM Courts & Tribunals Service - GOV.UK';

export function pageTitle(title?: string): string {
  return title ? `${title} - ${PAGE_TITLE_SUFFIX}` : PAGE_TITLE_SUFFIX;
}
