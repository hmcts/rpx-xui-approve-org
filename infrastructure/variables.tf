variable "product" {
  type = string
}

variable "component" {
  type = string
}

variable "team_name" {
  default = "expert_ui"
}

variable "app_language" {
    default = "node"
}

variable "location" {
  type = string
  default = "UK South"
}

variable "env" {}

variable "shared_product_name" {
    default = "rpx"
}

variable "subscription" {}

variable "ilbIp"{}

variable "tenant_id" {}

variable "jenkins_AAD_objectId" {
  type                        = string
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
  type = string
  default = "secretSauce"
}

variable "node_tls_reject_unathorized" {
  type = number
  default = 0
}
variable "api_port" {
  type = number
  default = 3001
}
variable "api_now" {
  type = bool
  default = false
}
variable "idam_client" {
  type = string
  default = "xuiaowebapp"
}
variable "oauth_callback_url" {
  type = string
  default = "/oauth2/callback"
}
variable "max_log_line" {
  type = number
  default = 80
}
variable "exception_options_max_lines" {
  type = number
  default = 1
}
variable "index_url" {
  type = string
  default = "/"
}
variable "logging" {
  type = string
  default = "debug"
}
variable "protocol" {
  type = string
  default = "https"
}
variable "secure_cookie" {
  type = bool
  default = false
}
variable "cookie_token" {
  type = string
  default = "__auth__"
}
variable "cookie_user_id" {
  type = string
  default = "__userid__"
}
variable "microservice" {
  type = string
  default = "xui_webapp"
}
variable "ccd_data_api_service" {}
variable "ccd_definition_api_service" {}
variable "idam_api_service" {}
variable "idam_web_service" {}
variable "rd_professional_api_service" {}
variable "s2s_service" {}

variable "proxy_host" {}
variable "proxy_port" {
  type = number
  default = 0
}
