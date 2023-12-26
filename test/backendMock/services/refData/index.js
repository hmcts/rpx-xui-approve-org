

class RefDataMock{

    constructor(){
        this.organisations = []

        this.setupOrganisationsData();
    }

    setupOrganisationsData(){
        for(let i = 100 ; i < 200; i++){
            const orgtemp = getOrgTemplate();
            orgtemp.name = `Mock oragnisation pending ${i}`
            orgtemp.organisationIdentifier = `PEN${i}`
            orgtemp.status = 'PENDING'

            this.organisations.push(orgtemp)
        }

        for (let i = 200; i < 300; i++) {
            const orgtemp = getOrgTemplate();
            orgtemp.name = `Mock oragnisation in review ${i}`
            orgtemp.organisationIdentifier = `REV${i}`
            orgtemp.status = 'REVIEW'

            this.organisations.push(orgtemp)
        }
        for (let i = 300; i < 400; i++) {
            const orgtemp = getOrgTemplate();
            orgtemp.name = `Mock oragnisation active ${i}`
            orgtemp.organisationIdentifier = `ACT${i}`
            orgtemp.status = 'ACTIVE'

            this.organisations.push(orgtemp)
        }
    }

    getOrganisationsWithStatus(statuses, pageNum, size){
        const orgs = []
        const statusList = statuses.split(',')
        for (let i = 0; i < size; i++) {
            const orgtemp = getOrgTemplate();
            orgtemp.name = `Mock oragnisation active ${100 * pageNum+i}`
            orgtemp.organisationIdentifier = `${statuses.includes('PENDING') ? 'PEN' : 'ACT'}${100 * pageNum+i}`
            orgtemp.status = statuses.includes('PENDING') ? 'PENDING':'ACTIVE'

            orgs.push(orgtemp)
        }
        return {
            organisations: orgs
        }
    }


    getOrganisationWithStatus(id) {
        const orgtemp = getOrgTemplate();
        orgtemp.name = `Mock oragnisation ${id}`
        orgtemp.organisationIdentifier = id
        orgtemp.status = id.includes('PEN') ? 'PENDING' : 'ACTIVE'

        return orgtemp
    }

    getOrganisationUsers(orgid, pageNum, size){
        const users = [];
        const res = {
            organisationIdentifier: orgid,
            users : []
        }
        for(let i = 0 ; i < 10; i++){
            users.push({
                email:`test_user_${i}@mock.com`,
                firstName: `firstname test ${i}`,
                lastName: `lastname test ${i}`,
                useridentifier: `017ac84e-659e-4897-8d92-9f4c22ea4ae${i}`,
                idamStatus:'ACTIVE'
            })
        }
        res.users = users;
        return res;
    }

}

function getOrgTemplate(){
    return {
        name: "001fcFuzqHZCE6UptKv3 EsqkclX1AU9OTRJxsGSA",
        organisationIdentifier: "SGSSMI1",
        contactInformation: [
            {
                addressId: "d77666e1-7448-4af7-a63d-ee8988baf958",
                uprn: null,
                created: "2023-05-06T22:02:31.085245",
                addressLine1: "432 high road",
                addressLine2: "001fcFuzqHZCE6UptKv3 EsqkclX1AU9OTRJxsGSA",
                addressLine3: "Maharaj road",
                townCity: "West Kirby",
                county: "Wirral",
                country: "UK",
                postCode: "KT25BU",
                dxAddress: [
                    {
                        dxNumber: "DX 1121111990",
                        dxExchange: "112111192099908492",
                    },
                ],
            },
        ],
        status: "ACTIVE",
        sraId: "TRAVKTmuQaQhgmD43L",
        sraRegulated: true,
        companyNumber: "Qq6ZuZtT",
        companyUrl: "www.tr8i6YCkUYTMaBDug.com",
        superUser: {
            firstName: "001fcFuzqHZCE6UptKv3",
            lastName: "EsqkclX1AU9OTRJxsGSAs",
            email: "superuser5xhccjjzgskmzxo@prdperftestuser.com",
        },
        paymentAccount: [
            "PBA8NMHAFU",
        ],
        pendingPaymentAccount: [
            "PBAHVLLDMH",
            "PBAEWJMYXB",
        ],
        dateReceived: "2023-05-06T22:02:31.04096",
        dateApproved: "2023-05-06T22:02:38.994188",
    }
}

module.exports = new RefDataMock()
