terraform {
  backend "azurerm" {}
}

data "terraform_remote_state" "core_apps_infrastructure" {
  backend = "azurerm"

  config {
    resource_group_name  = "mgmt-state-store-${var.subscription}"
    storage_account_name = "mgmtstatestore${var.subscription}"
    container_name       = "mgmtstatestorecontainer${var.env}"
    key                  = "core-infra-ao/${var.env}/terraform.tfstate"
  }
}

data "terraform_remote_state" "core_apps_compute" {
  backend = "azurerm"

  config {
    resource_group_name  = "mgmt-state-store-${var.subscription}"
    storage_account_name = "mgmtstatestore${var.subscription}"
    container_name       = "mgmtstatestorecontainer${var.env}"
    key                  = "core-compute-ao/${var.env}/terraform.tfstate"
  }
}