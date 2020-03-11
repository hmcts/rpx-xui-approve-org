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
      if (org) {
        const isIncludeInName = org.name && org.name.toLowerCase().includes(searchFilter);
        const isIncludeInPostcode = org.postCode && org.postCode.toLowerCase().includes(searchFilter);
        const isIncludeInSraId = org.sraId && org.sraId.toLowerCase().includes(searchFilter);
        const isIncludeInAdmin = org.admin && org.admin.toLowerCase().includes(searchFilter);
        const isIncludeInPbaNumber1 = org.pbaNumber && org.pbaNumber.length >= 1 && org.pbaNumber[0].toLowerCase().includes(searchFilter);
        const isIncludeInPbaNumber2 = org.pbaNumber && org.pbaNumber.length >= 2 && org.pbaNumber[org.pbaNumber.length - 1].toLowerCase().includes(searchFilter);
        const isIncludeInDxNumber = org.dxNumber && org.dxNumber.length >= 1 && org.dxNumber[0] && org.dxNumber[0].dxNumber && org.dxNumber[0].dxNumber.toLowerCase().includes(searchFilter);
        const isIncludeInDxExchange = org.dxNumber && org.dxNumber.length >= 1 && org.dxNumber[0] && org.dxNumber[0].dxExchange && org.dxNumber[0].dxExchange.toLowerCase().includes(searchFilter);
        return isIncludeInName || isIncludeInPostcode || isIncludeInSraId || isIncludeInPbaNumber1 || isIncludeInPbaNumber2 || isIncludeInDxNumber || isIncludeInDxExchange || isIncludeInAdmin;
      }
      return false;
    });
  }
}
