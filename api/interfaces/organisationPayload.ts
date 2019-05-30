export interface OrganisationPayload {
    name: string,
    url?: string,
    superUser: {
        firstName: string,
        lastName: string,
        email: string,
    }
    pbaAccounts: [
        {
            pbaNumber: string,
        },
        {
            pbaNumber: string,
        }
        ],
    dxAddress?: {
        dxExchange: string,
        dxNumber: string,
    },
    address: {
        /**
         * TODO: houseNoBuildingName should be optional, remove when it is.
         * @see payloadBuilder.ts for descriptive comments.
         */
        houseNoBuildingName: string,
        addressLine1: string,
        addressLine2?: string,
        townCity: string,
        county: string,
        postcode: string,
    }
}
