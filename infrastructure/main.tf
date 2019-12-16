locals {
    app_full_name = "xui-${var.component}"
    ase_name = "core-compute-${var.env}"
    local_env = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"
    shared_vault_name = "${var.shared_product_name}-${local.local_env}"
}

module "app" {
    source = "git@github.com:hmcts/cnp-module-webapp?ref=master"
    product = "${local.app_full_name}"
    location = "${var.location}"
    env = "${var.env}"
    ilbIp = "${var.ilbIp}"
    subscription = "${var.subscription}"
    capacity     = "${var.capacity}"
    is_frontend = "${!(var.env == "preview" || var.env == "spreview") ? 1 : 0}"
    additional_host_name = "${var.additional_host_name}"
    https_only="true"
    common_tags  = "${var.common_tags}"
    asp_rg = "${local.app_full_name}-${var.env}"
    asp_name = "${var.shared_product_name}-${var.env}"


    app_settings = {
        # logging vars & healthcheck
        REFORM_SERVICE_NAME = "${local.app_full_name}"
        REFORM_TEAM = "${var.team_name}"
        REFORM_SERVICE_TYPE = "${var.app_language}"
        REFORM_ENVIRONMENT = "${var.env}"

        PACKAGES_NAME = "${local.app_full_name}"
        PACKAGES_PROJECT = "${var.team_name}"
        PACKAGES_ENVIRONMENT = "${var.env}"
        PUI_ENV = "${var.env}"
        NODE_ENV = "${var.env}"

        S2S_SECRET = "${data.azurerm_key_vault_secret.s2s_secret.value}"
        IDAM_SECRET = "${data.azurerm_key_vault_secret.oauth2_secret.value}"

        # API CONFIG
        SESSION_SECRET = "${var.session_secret}"
        NODE_TLS_REJECT_UNAUTHORIZED = "${var.node_tls_reject_unathorized}"
        NOW = "${var.api_now}"
        IDAM_CLIENT = "${var.idam_client}"
        OAUTH_CALLBACK_URL = "${var.oauth_callback_url}"
        MAX_LOG_LINE = "${var.max_log_line}"
        EXCEPTION_OPTIONS_MAX_LINES = "${var.exception_options_max_lines}"
        INDEX_URL = "${var.index_url}"
        LOGGING = "${var.logging}"
        PROTOCOL = "${var.protocol}"

        # COOKIE SETTINGS
        SECURE_COOKIE = "${var.secure_cookie}"
        COOKIE_TOKEN = "${var.cookie_token}"
        COOKIE_USER_ID = "${var.cookie_user_id}"
        MICROSERVICE = "${var.microservice}"

        # SERVICE URLS
        CCD_DATA_API_SERVICE = "${var.ccd_data_api_service}"
        CCD_DEFINITION_API_SERVICE = "${var.ccd_definition_api_service}"
        IDAM_API_SERVICE = "${var.idam_api_service}"
        IDAM_WEB_SERVICE = "${var.idam_web_service}"
        RD_PROFESSIONAL_API_SERVICE = "${var.rd_professional_api_service}"
        S2S_SERVICE = "${var.s2s_service}"

        # PROXY
        PROXY_HOST = "${var.proxy_host}"
        PROXY_PORT = "${var.proxy_port}"

        TEST_ITHC_VAR = "${var.test_ithc_var}"
    }
}


data "azurerm_key_vault" "key_vault" {
    name = "${local.shared_vault_name}"
    resource_group_name = "${local.shared_vault_name}"
}

data "azurerm_key_vault_secret" "s2s_secret" {
    name = "ao-s2s-client-secret"
    vault_uri = "${data.azurerm_key_vault.key_vault.vault_uri}"
}

data "azurerm_key_vault_secret" "oauth2_secret" {
    name = "ao-idam-client-secret"
    vault_uri = "${data.azurerm_key_vault.key_vault.vault_uri}"
}

provider "azurerm" {
    version = "1.22.1"
}
