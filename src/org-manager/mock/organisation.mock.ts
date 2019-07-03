import { Organisation, OrganisationAddress } from '../models/organisation';

export const OrganisationsMock: Organisation[] = [{
  organisationIdentifier: "12345678",
  contactInformation: [{ addressLine1: "72 Guild Street",
      townCity: "London",
      county: "WestMinster",
      dxAddress: [{
        dxNumber: "",
        dxExchange: ""
    }]
    }
  ],
  superUser: { userIdentifier: "",
    firstName: "Matt",
    lastName: "Speake",
    email: "matt@speake.com"
  },
  status: "ACTIVE",
  name: "Speake Limited"
},
{
  organisationIdentifier: "23456433",
  contactInformation: [{ addressLine1: "72 Guild Street",
      townCity: "London",
      county: "WestMinster",
      dxAddress: [{
        dxNumber: "",
        dxExchange: ""
    }]
    }
  ],
  superUser: { userIdentifier: "",
    firstName: "Mia",
    lastName: "Mamatora",
    email: "mia@mamatora.com",
  },
  status: "ACTIVE",
  name: "Miamora Limited"
}
];
