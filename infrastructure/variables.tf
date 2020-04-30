variable "product" {
  type = "string"
}

variable "component" {
  type = "string"
}

variable "team_name" {
  default = "expert_ui"
}

variable "app_language" {
    default = "node"
}

variable "location" {
  type = "string"
  default = "UK South"
}

variable "env" {
  type = "string"
}

variable "shared_product_name" {
    default = "rpx"
}

variable "subscription" {
  type = "string"
}

variable "ilbIp"{}

variable "tenant_id" {}

variable "jenkins_AAD_objectId" {
  type                        = "string"
  description                 = "(Required) The Azure AD object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies."
}

variable "common_tags" {
  type = "map"
}

////////////////////////////////////////////////
//Addtional Vars ///////////////////////////////
////////////////////////////////////////////////
variable "capacity" {
  default = "1"
}

variable "additional_host_name" {
    default = "null"
}

variable "session_secret" {
  default = "secretSauce"
}

variable "node_tls_reject_unathorized" {
  default = "1"
}
variable "api_now" {
  default = "false"
}
variable "idam_client" {
  default = "xuiaowebapp"
}
variable "oauth_callback_url" {
  default = "/oauth2/callback"
}
variable "max_log_line" {
  default = "80"
}
variable "exception_options_max_lines" {
  default = "1"
}
variable "index_url" {
  default = "/"
}
variable "logging" {
  default = "debug"
}
variable "protocol" {
  default = "https"
}
variable "cookie_token" {
  default = "__auth__"
}
variable "cookie_user_id" {
  default = "__userid__"
}
variable "cookie_roles" {
  default = "roles"
}
variable "microservice" {
  default = "xui_webapp"
}
variable "ccd_data_api_service" {}
variable "ccd_definition_api_service" {}
variable "idam_api_service" {}
variable "idam_web_service" {}
variable "rd_professional_api_service" {}
variable "s2s_service" {}
variable "fee_and_pay_api" {}

variable "allow_config_mutations" {
  default = "1"
}

// FEATURE TOGGLE VARS
variable "feature_secure_cookie_enabled" {
  default = "true"
}
variable "feature_app_insights_enabled" {
  default = "true"
}

variable "feature_redis_enabled" {
  default = "true"
}
variable "feature_oidc_enabled" {
  default = "false"
}

variable "feature_proxy_enabled" {
  default = "false"
}
variable "feature_helmet_enabled" {
  default = "false"
}

variable "node_config_dir" {
  // for Windows
  default = "D:\\home\\site\\wwwroot\\config"
}

variable "ao_http_proxy" {
  default = "http://172.16.0.7:8080"
}

variable "ao_no_proxy" {
  default = "localhost"
}

variable "iss_service" {}

variable "enable_ase" {
    default = false
}