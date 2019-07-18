import {AppUtils} from './app-utils';

describe('AppUtils', () => {

  it('should set correct page titles', () => {
    const array = AppUtils.setPageTitle('pending-organisations/organisation/');
    expect(array).toEqual('Pending organisation details - Approve organisation');
  });
  it('should set correct page titles', () => {
    const array = AppUtils.setPageTitle('pending-organisations/approve-success');
    expect(array).toEqual('Confirmation - Approve organisations');
  });
  it('should set correct page titles', () => {
    const array = AppUtils.setPageTitle('pending-organisations/approve');
    expect(array).toEqual('Check details - Approve organisations');
  });
  it('should set correct page titles', () => {
    const array = AppUtils.setPageTitle('pending-organisations');
    expect(array).toEqual('Pending organisations - Approve organisations');
  });
  it('should set correct page titles', () => {
    const array = AppUtils.setPageTitle('pending-organisations/approve');
    expect(array).toEqual('Check details - Approve organisations');
  });

});
