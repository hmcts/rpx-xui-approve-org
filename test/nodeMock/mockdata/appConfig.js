
class AppConfigMock{

    getEnvConfig(){
        return {
            "configEnv": "development",
            "cookies": {
                "roles": "roles",
                "token": "__auth__",
                "userId": "__userid__"
            },
            "exceptionOptions": {
                "maxLines": 1
            },
            "health": {
                "ccdDataApi": "https://gateway-ccd.aat.platform.hmcts.net/health",
                "ccdDefApi": "http://ccd-definition-store-api-aat.service.core-compute-aat.internal/health",
                "feeAndPayApi": "http://payment-api-aat.service.core-compute-aat.internal/health",
                "idamApi": "https://idam-api.aat.platform.hmcts.net/health",
                "idamWeb": "https://idam-web-public.aat.platform.hmcts.net/health",
                "rdProfessionalApi": "http://rd-professional-api-aat.service.core-compute-aat.internal/health",
                "s2s": "http://rpe-service-auth-provider-aat.service.core-compute-aat.internal/health"
            },
            "idamClient": "xuiaowebapp",
            "indexUrl": "/",
            "iss": "https://forgerock-am.service.core-compute-idam-aat2.internal:8443/openam/oauth2/realms/root/realms/hmcts",
            "logging": "debug",
            "maxLogLine": 80,
            "microservice": "xui_webapp",
            "now": false,
            "oauthCallbackUrl": "/oauth2/callback",
            "oidcEnabled": false,
            "protocol": "http",
            "secureCookie": false,
            "services": {
                "ccdDataApi": "https://gateway-ccd.aat.platform.hmcts.net",
                "ccdDefApi": "http://ccd-definition-store-api-aat.service.core-compute-aat.internal",
                "feeAndPayApi": "http://payment-api-aat.service.core-compute-aat.internal",
                "idamApi": "https://idam-api.aat.platform.hmcts.net",
                "idamWeb": "https://idam-web-public.aat.platform.hmcts.net",
                "iss": "https://forgerock-am.service.core-compute-idam-aat2.internal:8443/openam/oauth2/realms/root/realms/hmcts",
                "rdProfessionalApi": "http://rd-professional-api-aat.service.core-compute-aat.internal",
                "s2s": "http://rpe-service-auth-provider-aat.service.core-compute-aat.internal"
            },
            "sessionSecret": "secretSauce",
            "launchDarklyClientId": "5de6610b23ce5408280f2268"
        };
    }
}
module.exports = new AppConfigMock();
