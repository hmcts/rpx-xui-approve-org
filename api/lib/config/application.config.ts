export const application = {
    cookies: {
        token: '__auth__',
        userId: '__userid__',
    },
    microservice: 'xui_webapp',
    idamClient: 'xuiwebapp',
    oauthCallbackUrl: '/oauth2/callback',
    idamLoginUrl:'https://idam-web-public.preview.platform.hmcts.net',
    protocol: 'https',
    logging: 'debug',
    maxLogLine: 80,
    exceptionOptions: {
        maxLines: 1,
    },
    indexUrl: '/',
    secureCookie: false,
    sessionSecret: 'secretSauce',
}
