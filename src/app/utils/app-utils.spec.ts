import {AppUtils} from './app-utils';

describe('AppUtils', () => {

  it('should set correct page titles pending details', () => {
    const array = AppUtils.setPageTitle('/pending-organisations/organisation/');
    expect(array).toEqual('Pending organisation details - Approve organisation');
  });
  it('should set correct page titles confirmation', () => {
    const array = AppUtils.setPageTitle('/pending-organisations/approve');
    expect(array).toEqual('Check details - Approve organisations');
  });
  it('should set correct page titles check details', () => {
    const array = AppUtils.setPageTitle('/pending-organisations/approve-success');
    expect(array).toEqual('Confirmation - Approve organisations');
  });
  it('should set correct page titles pending ', () => {
    const array = AppUtils.setPageTitle('/pending-organisations');
    expect(array).toEqual('Pending organisations - Approve organisations');
  });
  it('should set correct page titles active details', () => {
    const array = AppUtils.setPageTitle('/organisations/organisation');
    expect(array).toEqual('Check details - Approve organisations');
  });
  it('should set correct page titles active details', () => {
    const array = AppUtils.setPageTitle('/organisations/organisation/');
    expect(array).toEqual('Active organisation details - Approve organisations');
  });
  it('should set correct page titles general fallback', () => {
    const array = AppUtils.setPageTitle('');
    expect(array).toEqual('Active organisations - Approve organisations');
  });
});
