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
variable "api_port" {
  default = "3000"
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
variable "secure_cookie" {
  default = "false"
}
variable "cookie_token" {
  default = "__auth__"
}
variable "cookie_user_id" {
  default = "__userid__"
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

variable "proxy_host" {
  default = "172.16.0.7"
}
variable "proxy_port" {
  default = "0"
}

variable "node_tls_reject_unauthorized" {
  default = "1"
}
