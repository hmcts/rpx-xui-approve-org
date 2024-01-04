

const conf = {
    baseUrl: process.env.TEST_URL || 'http://localhost:3000',
    username: 'vmuniganti@mailnesia.com',
    password: 'Monday01',
    approver_username: 'vamshiadminuser@mailnesia.com',
    approver_password: 'Testing123',
    cwdAdmin: 'cwd_admin@mailinator.com',
    cwdAdmPass: 'Welcome01',
    fr_judge_username: process.env.FR_EMAIL,
    fr_judge_password: process.env.FR_PASSWORD,
    sscs_username: process.env.SSCS_EMAIL,
    sscs_password: process.env.SSCS_PASSWORD
}

module.exports = conf
