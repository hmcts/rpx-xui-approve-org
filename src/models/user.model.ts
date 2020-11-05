export class UserModel {
    public id: string;
    public emailId: string;
    public firstName: string;
    public lastName: string;
    public status: string;
    public organisationId: string;
    public roles: string[];
    public idleTime: number;
    public timeout: number;
    constructor(prop) {
      Object.assign(this, prop);
    }
  }

export interface UserInterface {
    email: string;
    orgId: string;
    roles: string[];
    userId: string;
}

export interface UserAddress {
    id: string;
    addressLine1: string;
    addressLine2: string;
    townCity: string;
    county: string;
    country: string;
    postcode: string;
    userId: string;
  }
