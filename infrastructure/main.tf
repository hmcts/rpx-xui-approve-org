locals {
    app_full_name = "${var.product}-${var.component}"
    ase_name = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"
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
    additional_host_name = "${!(var.env == "preview" || var.env == "spreview") ? "${local.app_full_name}-${var.env}.service.${var.env}.platform.hmcts.net" : "null"}"
    https_only="false"
    common_tags  = "${var.common_tags}"
    asp_rg = "${var.shared_product_name}-${var.env}"
    asp_name = "rpx-${local.local_env}"

    app_settings = {
        WEBSITE_NODE_DEFAULT_VERSION = "8.8.0"

        XUI_ORG_ENV = "${var.env}"

        # logging vars & healthcheck
        REFORM_SERVICE_NAME = "${local.app_full_name}"
        REFORM_TEAM = "${var.team_name}"
        REFORM_SERVICE_TYPE = "${var.app_language}"
        REFORM_ENVIRONMENT = "${var.env}"

        PACKAGES_NAME = "${local.app_full_name}"
        PACKAGES_PROJECT = "${var.team_name}"
        PACKAGES_ENVIRONMENT = "${var.env}"

    }
}
data "azurerm_key_vault" "key_vault" {
    name = "${local.shared_vault_name}"
    resource_group_name = "${local.shared_vault_name}"
}

provider "azurerm" {
  version = "1.19.0"
}
