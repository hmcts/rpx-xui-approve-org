import { Pipe, PipeTransform } from '@angular/core';
import { OrganisationVM } from '../models/organisation';

@Pipe({
  name: 'filterOrganisations'
})
export class FilterOrganisationsPipe implements PipeTransform {
  transform(orgs: OrganisationVM[], searchFilter: string, searchFields: {}): OrganisationVM[] {
    if (!orgs || !searchFields) { return []; }
    if (!searchFilter || searchFilter === '' || searchFields === {}) { return orgs; }
    searchFilter = searchFilter.toLowerCase();
    return orgs.filter((org: OrganisationVM) => {
      return org && ((searchFields['org-name'] && org.name.toLowerCase().includes(searchFilter)) ||
      (org.postCode && org.postCode.toLowerCase().includes(searchFilter) && searchFields['org-postcode']) ||
      (org.sraId && org.sraId.toLowerCase().includes(searchFilter) && searchFields['sra-number']) ||
      (org.pbaNumber && org.pbaNumber.length >= 1 && org.pbaNumber[0].toLowerCase().includes(searchFilter) && searchFields['pba-number']) ||
      (org.pbaNumber && org.pbaNumber.length >= 2 && org.pbaNumber[org.pbaNumber.length - 1].toLowerCase().includes(searchFilter) && searchFields['pba-number']) ||
      (org.dxNumber && org.dxNumber.length >= 1 && org.dxNumber[0] && org.dxNumber[0].dxNumber.toLowerCase().includes(searchFilter) && searchFields['dx-number']) ||
      (org.dxNumber && org.dxNumber.length >= 1 && org.dxNumber[0] && org.dxNumber[0].dxExchange.toLowerCase().includes(searchFilter)  && searchFields['dx-exchange']));
    });
  }
}
