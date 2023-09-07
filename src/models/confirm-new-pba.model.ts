class NewPBAModel {
  public pbaNumber: string;
  public status: string;
  public statusMessage: string;
}

export interface ConfirmNewPBAModel {
  newPBAs: NewPBAModel[];
  orgId: string;
}
