import { Pipe, PipeTransform } from '@angular/core';

import { OrganisationVM } from '../models/organisation';

@Pipe({
  name: 'filterOrganisations'
})
export class FilterOrganisationsPipe implements PipeTransform {
  private static readonly TEXT_FIELDS_TO_CHECK = ['name', 'postCode', 'sraId', 'admin'];

  public transform(orgs: OrganisationVM[], searchFilter: string): OrganisationVM[] {
    if (!orgs) { return []; }
    if (!searchFilter || searchFilter === '') { return orgs; }
    searchFilter = searchFilter.toLowerCase();
    return orgs.filter((org: OrganisationVM) => {
      if (org) {
        for (const field of FilterOrganisationsPipe.TEXT_FIELDS_TO_CHECK) {
          if (this.textFieldMatches(org, field, searchFilter)) {
            return true;
          }
        }
        if (org.pbaNumber) {
          for (const pbaNumber of org.pbaNumber) {
            if (pbaNumber.toLowerCase().includes(searchFilter)) {
              return true;
            }
          }
        }
        if (org.dxNumber && org.dxNumber.length > 0) {
          const dxNumber = org.dxNumber[0];
          if (dxNumber) {
            const matchesDxNumber = dxNumber.dxNumber && dxNumber.dxNumber.toLowerCase().includes(searchFilter);
            const matchesDxExchange = dxNumber.dxExchange && dxNumber.dxExchange.toLowerCase().includes(searchFilter);
            return matchesDxNumber || matchesDxExchange;
          }
        }
      }
      return false;
    });
  }

  private textFieldMatches(org: OrganisationVM, field: string, filter: string): boolean {
    return org[field] && org[field].toLowerCase().includes(filter);
  }
}
