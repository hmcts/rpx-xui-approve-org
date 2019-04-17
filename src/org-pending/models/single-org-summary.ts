export interface SingleOrgSummary {
  name: string;
  address: string;
  status: string | 'Active';
  effective_date: string;
  dx_exchange: string;
  pbaNumber: string;
  dxNumber: string;
  dxExchange: string;
  admin: string;
  
}
export interface SingleOrgSummaryRemapped extends SingleOrgSummary {
  routerLink: string;
}
