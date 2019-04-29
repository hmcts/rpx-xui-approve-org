export interface PendingOrgSummary {
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
export interface PendingOrgSummaryRemapped extends PendingOrgSummary {
  routerLink: string;
}
