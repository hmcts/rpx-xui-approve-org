const fs = require('fs')
const path = require('path')

const axios = require('axios')

const session = require('./sampleSession.json')


class MockSessionService {
    constructor(mode) {
        this.http = axios.create({
            baseURL: "http://localhost:3000",
            timeout: 60000,
        })

        if (mode && mode === 'DEBUG') {
            this.sessionsPath = path.resolve(__dirname, '../../../../api/.sessions')

        } else {
            this.sessionsPath = path.resolve(__dirname, '../../../../.sessions')

        }
        console.log("Session path : " + this.sessionsPath)
        this.defaultSession = '';
    }


    setDefaultSession(session) {
        this.defaultSession = session.split(".")[0]
            .replace('s:', '');
    }

    async getCopyOfDefaultSession() {
        const sessionFile = `${this.sessionsPath}/${this.defaultSession}.json`;
        let sessionJson = await fs.readFileSync(sessionFile);
        return JSON.parse(sessionJson)
    }

    getSessionFiles() {


        console.log(this.sessionsPath)
        return fs.readdirSync(this.sessionsPath)
    }

    async updateSessionFile(filename) {

    }

    async getSessionCookies() {
        const res = await this.http.get('/external/configuration-ui/')
        return res.headers['set-cookie'];
    }

    async setUserSession(session, userDetails) {
        // const sessionCookies = await this.getSessionCookies();
        // const webAppSession = sessionCookies.find(cookie => cookie.includes('xui-webapp'));
        const sessionId = session.split(".")[0]
            .replace('s:', '')
        const sessionFile = `${this.sessionsPath}/${sessionId}.json`
        let sessionJson = await fs.readFileSync(sessionFile);
        sessionJson = JSON.parse(sessionJson)
        sessionJson.passport.user.userinfo.roles = ['caseworker', 'caseworker-iac-judge']

        fs.writeFileSync(sessionFile, JSON.stringify(sessionJson, null, 2), 'utf8');
        return "";

    }


    async getSessionFileAuth(auth) {
        const files = await this.getSessionFiles();
        let authSessionFile = null;
        for (const file of files) {
            const sessionFile = `${this.sessionsPath}/${file}`
            let sessionJson = await fs.readFileSync(sessionFile);
            try {
              sessionJson = JSON.parse(sessionJson)
              // console.log(sessionJson.passport?.user?.tokenset?.accessToken);
              // console.log(auth);
              if (sessionJson.passport?.user?.tokenset?.accessToken === auth) {
                authSessionFile = sessionFile;
                break;
              }
            } catch (err) {
              console.error ('Error reading session JSON file: ' + sessionFile + ' sessionJson: ' + sessionJson, err);
            }
        }
        return authSessionFile;
    }

    async updateAuthSessionWithRoles(auth, roles) {
        const sessionFile = await this.getSessionFileAuth(auth);
        let sessionJson = await fs.readFileSync(sessionFile);

        sessionJson = JSON.parse(sessionJson)

        sessionJson.passport.user.userinfo.roles = roles;
        await fs.writeFileSync(sessionFile, JSON.stringify(sessionJson, null, 2), 'utf8');
    }


    async updateAuthSessionWithUserInfo(auth, userInfo) {
        const sessionFile = await this.getSessionFileAuth(auth);
        let sessionJson = await fs.readFileSync(sessionFile);

        sessionJson = JSON.parse(sessionJson)

        sessionJson.passport.user.userinfo = userInfo;
        await fs.writeFileSync(sessionFile, JSON.stringify(sessionJson, null, 2), 'utf8');
    }

    async getSessionRolesAndRoleAssignments(auth) {
        const sessionFile = await this.getSessionFileAuth(auth);
        let sessionJson = await fs.readFileSync(sessionFile);
        sessionJson = JSON.parse(sessionJson)
        return {
            roles: sessionJson.passport.user.userinfo.roles,
            roleAssignments: sessionJson.roleAssignmentResponse
        }
    }

    captureRequestDetails(apiMethod, requestObj) {
        // apiMethod = apiMethod.toUpperCase();
        const token = requestObj.headers.authorization.replace('Bearer ', '')
        let userSession = this.sessionUsers.find(sess => sess.token === token)
        if (!userSession) {
            userSession = {
                requests: [],
                token: token,
                apiData: []
            };
            this.sessionUsers.push(userSession)
        }
        const apiResponse = userSession.apiData.find(methodData => methodData.method === apiMethod)
        if (!apiResponse) {
            userSession.apiData.push({
                method: apiMethod,
                response: null,
                request: {
                    body: requestObj.body
                }
            })
        } else {
            apiResponse.request = {
                body: requestObj.body
            }
        }

    }

    getCapturedRequestData(token, apiMethod) {
        let userSession = this.sessionUsers.find(sess => sess.token === token.replace('Bearer ', ''))
        if (!userSession) {
            return null;
        }
        const apiResponse = userSession.apiData.find(methodData => methodData.method === apiMethod)
        return apiResponse ? apiResponse.request : null
    }
}



const mode = process.env.DEBUG && process.env.DEBUG === "true" ? "DEBUG" : ""
module.exports = new MockSessionService(mode);


async function sleepForSeconds(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, seconds * 1000)
    })
}
