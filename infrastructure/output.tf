output "microserviceName" {
  value = local.app_full_name
}

output "appInsightsInstrumentationKey" {
  value     = module.application_insights.instrumentation_key
  sensitive = true
}
