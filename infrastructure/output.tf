output "microserviceName" {
  value = "${local.app_full_name}"
}

output "appInsightsInstrumentationKey" {
  value = "${azurerm_application_insights.appinsights.instrumentation_key}"
}
