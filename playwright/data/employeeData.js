const { serviceTestData } = require('./serviceTestData');

module.exports = {
  employeeData: {
    firstName: 'John',
    lastName: 'Doe',
    emailID: `akasham.mohod.${Date.now()}@test.com`, // MUST be emailID
    role: 'Manager',
    location: 'Mumbai',
    description: 'This is a generic employee description for automation testing.',
  },
  serviceTestData,
};