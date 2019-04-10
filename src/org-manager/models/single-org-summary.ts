export interface SingleOrgSummary {
  account_number: string;
  account_name: string;
  name: string;
  address: string;
  credit_limit: number;
  available_balance: number;
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
