export interface  PbaAccounts {
  organisationId: string;
  pbaNumber: string;
  admin: string;
  status: string;
  view: string;
  userId?:	string
}
export interface PbaAccountsSummary extends PbaAccounts {
  routerLink: string;
}


