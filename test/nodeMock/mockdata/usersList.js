
class UsersList{
  getAllUsersListForOrganisation(orgId){
    const usersOfOrganisation = {
      organisationIdentifier: orgId,
      users: []
    };

    for (let i = 0; i < 10; i++){
      usersOfOrganisation.users.push({
        email: `test${i}@test.com`,
        firstName: `fn${i}`,
        lastName: `ln${i}`,
        idamStatus: 'ACTIVE',
        userIdentifier: `519e0c40-d30e-4f42-8a4c-2c79838f0e4${i}`
      });
    }

    return usersOfOrganisation;
  }
}

module.exports = new UsersList();
