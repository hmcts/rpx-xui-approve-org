import { application } from "./application.config";

import * as local from "./environments/local.config";
import * as docker from "./environments/docker.config";
import * as preview from "./environments/preview.config";
import * as aat from "./environments/aat.config";
import * as prod from "./environments/prod.config";
import * as process from "process";

const configs = {
    local,
    docker,
    preview,
    aat,
    prod,
    microservice: "xuiaowebapp",
    idam_client: "xuiaowebapp",
    oauth_callback_url: "oauth2/callback",
    protocol: "https"
};

export const configEnv = process ? process.env.XUI_ENV || "local" : "local";
export const config = { ...application, ...configs[configEnv].default };

if (process) {
    config.appInsightsInstrumentationKey =
        process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "AAAAAAAAAAAAAAAA";
}

if (configEnv === 'local') {
    config.protocol = 'http';
}

