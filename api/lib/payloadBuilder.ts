import {OrganisationPayload} from '../interfaces/organisationPayload'

/**
 * makeOrganisationPayload
 *
 * Constructs payload to POST data to the /activeOrg endpoint.
 *
 * TODO: Note that if we add the dxAddress in, we get a 500 status error.
 * Fix required on the api. Awaiting fix. JIRA ticket raised: PUID-103
 *
 * TODO: houseNoBuildingName should not be an mandatory field on the api,
 * but an optional one. Hence it's currently an empty string, to prevent
 * a 500. JIRA ticket: PUID-111
 *
 * @param stateValues
 * @return
 */
export function makeOrganisationPayload(stateValues): OrganisationPayload {
    return {
        address: {
            addressLine1: stateValues.officeAddressOne,
            addressLine2: stateValues.officeAddressTwo,
            county: stateValues.county,
            houseNoBuildingName: 'Remove property on api fix @see comments',
            postcode: stateValues.postcode,
            townCity: stateValues.townOrCity,
        },
        name: stateValues.orgName,
        pbaAccounts: [
            {
                pbaNumber: stateValues.PBAnumber1,
            },
            {
                pbaNumber: stateValues.PBAnumber2,
            },
        ],
        superUser: {
            email: stateValues.emailAddress,
            firstName: stateValues.firstName,
            lastName: stateValues.lastName,
        },
    }
}
