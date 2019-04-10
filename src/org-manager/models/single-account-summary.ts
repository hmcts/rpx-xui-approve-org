export interface SingleAccontSummary {
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
export interface SingleAccontSummaryRemapped extends SingleAccontSummary {
  routerLink: string;
}
