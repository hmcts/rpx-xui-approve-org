import { Pipe, PipeTransform } from '@angular/core';
import { OrganisationVM } from '../models/organisation';

@Pipe({
  name: 'filterOrganisations'
})
export class FilterOrganisationsPipe implements PipeTransform {
  public transform(orgs: OrganisationVM[], searchFilter: string): OrganisationVM[] {
    if (!orgs) { return []; }
    if (!searchFilter || searchFilter === '') { return orgs; }
    searchFilter = searchFilter.toLowerCase();
    return orgs.filter((org: OrganisationVM) => {
      return org && org.name.toLowerCase().includes(searchFilter) ||
      (org.postCode && org.postCode.toLowerCase().includes(searchFilter)) ||
      (org.sraId && org.sraId.toLowerCase().includes(searchFilter)) ||
      (org.pbaNumber && org.pbaNumber.length >= 1 && org.pbaNumber[0].toLowerCase().includes(searchFilter)) ||
      (org.pbaNumber && org.pbaNumber.length >= 2 && org.pbaNumber[org.pbaNumber.length - 1].toLowerCase().includes(searchFilter)) ||
      (org.dxNumber && org.dxNumber.length >= 1 && org.dxNumber[0] && org.dxNumber[0].dxNumber.toLowerCase().includes(searchFilter) ) ||
      (org.dxNumber && org.dxNumber.length >= 1 && org.dxNumber[0] && org.dxNumber[0].dxExchange.toLowerCase().includes(searchFilter));
    });
  }
}
