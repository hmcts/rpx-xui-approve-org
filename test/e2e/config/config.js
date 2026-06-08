

const conf = {
    baseUrl: process.env.TEST_URL || 'http://localhost:3000',
    username: '',
    password: '',
    approver_username: '',
    approver_password: '',
    cwdAdmin: '',
    cwdAdmPass: '',
    fr_judge_username: process.env.FR_EMAIL,
    fr_judge_password: process.env.FR_PASSWORD,
    sscs_username: process.env.SSCS_EMAIL,
    sscs_password: process.env.SSCS_PASSWORD
}

module.exports = conf
