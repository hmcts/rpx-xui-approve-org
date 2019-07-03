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
}
];
  /*{
    name: 'Speake Limited',
    //address: '72 Guild Street, London, SE23 6FH',
    //organisationIdentifier: 'SU2DSCSA',
    //admin: 'Matt Speake',
    status: 'ACTIVE'
    //view: 'View',
    organisationIdentifier: '12345678',
    //email: 'matt@speake.com'
  },
  // {
  //   name: 'Miamora Limited',
  //   //address: '72 Guild Street, London, SE23 6FH',
  //   pbaNumber: '2A2ABCDFFFA',
  //   admin: 'Mia Mamatora',
  //   status: 'ACTIVE',
  //   view: 'View',
  //   organisationIdentifier: '23456433',
  //   email: 'mia@mamatora.com'
  // }
];*/
