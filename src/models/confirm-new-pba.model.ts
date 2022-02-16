class NewPBAModel {
  pbaNumber: string;
  status: string;
  statusMessage: string;
}

export interface ConfirmNewPBAModel{
  newPBAs: NewPBAModel[]
  orgId: string;
}
