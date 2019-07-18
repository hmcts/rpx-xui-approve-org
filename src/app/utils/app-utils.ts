/**
 * Contains static stateless utility methods for the App
 *
 */
export class AppUtils {

  static setPageTitle(url): string {
    /**
     * it sets correct page titles
     */
    if (url.indexOf('pending-organisations/organisation/') !== -1) {
      return 'Pending organisation details - Approve organisation';
    } else if (url.indexOf('pending-organisations/approve-success') !== -1) {
      return 'Confirmation - Approve organisations';
    } else if (url.indexOf('pending-organisations/approve') !== -1) {
      return 'Check details - Approve organisations';
    } else if (url.indexOf('pending-organisations') !== -1) {
      return 'Pending organisations - Approve organisations';
    } else if (url.indexOf('pending-organisations/approve') !== -1) {
      return 'Check details - Approve organisations';
    }
    return 'Active organisations - Approve organisations';
  }
}
