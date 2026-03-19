export interface OrganisationPayload {
  name: string;
  sraId?: string;
  superUser: {
    firstName: string;
    lastName: string;
    email: string;
  };
  paymentAccount: string[];
  contactInformation: Array<{
    addressLine1: string;
    addressLine2?: string;
    townCity: string;
    county: string;
    postCode: string;
    dxAddress?: Array<{
      dxExchange: string;
      dxNumber: string;
    }>;
  }>;
}
