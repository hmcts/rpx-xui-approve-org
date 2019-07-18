/**
 * Contains static stateless utility methods for the App
 *
 */
export class AppUtils {

  static setPageTitle(url): string {
    /**
     * it sets correct page titles
     */
    if (url === 'pending-organisations/organisation/') {
      return 'Pending organisation details - Approve organisation';
    } else if (url === 'pending-organisations/approve-success') {
      return 'Confirmation - Approve organisations';
    } else if (url === 'pending-organisations/approve') {
      return 'Check details - Approve organisations';
    } else if (url === 'pending-organisations/approve-success') {
      return 'Confirmation - Approve organisations';
    } else if (url === 'pending-organisations') {
      return 'Pending organisations - Approve organisations';
    } else if (url === 'pending-organisations/approve') {
      return 'Check details - Approve organisations';
    } else if (url.indexOf('organisations/organisation') !== -1) {
      return 'Check details - Approve organisations';
    }

    return 'Active organisations - Approve organisations';
  }
}
