#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/populate-env-from-keyvault.sh <environment> [output_path] [template_path]

Arguments:
  environment    Target environment: aat or demo
  output_path    Optional output file path (default: .env)
  template_path  Optional template file path (default: .env.example)
USAGE
}

resolve_vault_name() {
  local environment
  environment="$(echo "$1" | tr '[:upper:]' '[:lower:]')"

  case "$environment" in
    aat)
      echo "rpx-aat"
      ;;
    demo)
      echo "rpx-demo"
      ;;
    *)
      echo ""
      ;;
  esac
}

extract_template_keys() {
  local template_path="$1"

  awk '
    /^[[:space:]]*#/ { next }
    /^[[:space:]]*$/ { next }
    {
      line = $0
      sub(/^[[:space:]]*export[[:space:]]+/, "", line)
      split(line, parts, "=")
      key = parts[1]
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", key)
      if (key != "" && !seen[key]++) {
        print key
      }
    }
  ' "$template_path"
}

escape_env_value() {
  local raw_value="$1"
  local escaped_value

  escaped_value="${raw_value//\\/\\\\}"
  escaped_value="${escaped_value//\"/\\\"}"
  escaped_value="${escaped_value//$'\n'/\\n}"

  printf '"%s"' "$escaped_value"
}

fallback_secret_name_for_env_key() {
  case "$1" in
    TEST_ROO_EMAIL)
      echo "test-roo-username"
      ;;
    TEST_ROO_PASSWORD)
      echo "test-roo-password"
      ;;
    *)
      echo ""
      ;;
  esac
}

if [[ $# -lt 1 || $# -gt 3 ]]; then
  usage
  exit 1
fi

if ! command -v az >/dev/null 2>&1; then
  echo "Error: Azure CLI (az) is required but not installed or not in PATH." >&2
  exit 1
fi

environment="$(echo "$1" | tr '[:upper:]' '[:lower:]')"
output_path="${2:-.env}"
template_path="${3:-.env.example}"
vault_name="$(resolve_vault_name "$environment")"

if [[ -z "$vault_name" ]]; then
  echo "Error: Unsupported environment '$environment'. Use one of: aat, demo." >&2
  exit 1
fi

if [[ ! -f "$template_path" ]]; then
  echo "Error: Template file '$template_path' does not exist." >&2
  exit 1
fi

if ! az account show --output none >/dev/null 2>&1; then
  echo "Error: Azure CLI is not authenticated. Run: az login" >&2
  exit 1
fi

if ! az keyvault secret list --vault-name "$vault_name" --maxresults 1 --query "[].id" --output tsv >/dev/null 2>&1; then
  echo "Error: Unable to access Key Vault '$vault_name'. Check vault name and data-plane access permissions." >&2
  exit 1
fi

output_dir="$(dirname "$output_path")"
mkdir -p "$output_dir"

temp_output="$(mktemp)"
trap 'rm -f "$temp_output"' EXIT

{
  echo "# Generated from Azure Key Vault ($vault_name)"
  echo "# Environment: $environment"
  echo "# Template: $template_path"
} > "$temp_output"

resolved_count=0
missing_count=0
total_count=0

while IFS= read -r env_key; do
  total_count=$((total_count + 1))
  local_population_tag="$env_key"

  if [[ "$env_key" == "PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS" ]]; then
    if secret_value="$(az keyvault secret show --vault-name "$vault_name" --name "xui-approve-org-playwright-global-excluded-tags" --query value --output tsv 2>/dev/null)"; then
      if [[ "$secret_value" == "null" ]]; then
        secret_value=""
      fi

      echo "$env_key=$(escape_env_value "$secret_value")" >> "$temp_output"
      resolved_count=$((resolved_count + 1))
      continue
    fi

    local_population_tag="APPROVE_ORG_PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS"
  fi

  secret_ids="$(az keyvault secret list \
    --vault-name "$vault_name" \
    --query "[?tags.e2e=='$local_population_tag'].id" \
    --output tsv)"

  if [[ -z "$secret_ids" ]]; then
    fallback_secret_name="$(fallback_secret_name_for_env_key "$env_key")"
    if [[ -n "$fallback_secret_name" ]]; then
      if secret_value="$(az keyvault secret show --vault-name "$vault_name" --name "$fallback_secret_name" --query value --output tsv 2>/dev/null)"; then
        if [[ "$secret_value" == "null" ]]; then
          secret_value=""
        fi

        echo "$env_key=$(escape_env_value "$secret_value")" >> "$temp_output"
        resolved_count=$((resolved_count + 1))
        continue
      fi
    fi

    echo "Warning: No secret found in $vault_name with tags.e2e=$local_population_tag. Writing blank value." >&2
    echo "$env_key=" >> "$temp_output"
    missing_count=$((missing_count + 1))
    continue
  fi

  secret_count="$(printf '%s\n' "$secret_ids" | awk 'NF {count += 1} END {print count + 0}')"
  if [[ "$secret_count" -gt 1 ]]; then
    echo "Warning: Multiple secrets found in $vault_name with tags.e2e=$local_population_tag. Using the first match." >&2
  fi

  first_secret_id="$(printf '%s\n' "$secret_ids" | awk 'NF {print; exit}')"

  if ! secret_value="$(az keyvault secret show --id "$first_secret_id" --query value --output tsv 2>/dev/null)"; then
    echo "Warning: Failed to resolve value for $env_key from $first_secret_id. Writing blank value." >&2
    echo "$env_key=" >> "$temp_output"
    missing_count=$((missing_count + 1))
    continue
  fi

  if [[ "$secret_value" == "null" ]]; then
    secret_value=""
  fi

  echo "$env_key=$(escape_env_value "$secret_value")" >> "$temp_output"
  resolved_count=$((resolved_count + 1))
done < <(extract_template_keys "$template_path")

mv "$temp_output" "$output_path"
chmod 600 "$output_path" 2>/dev/null || true

{
  echo "Generated $output_path from $template_path using vault $vault_name"
  echo "Resolved keys: $resolved_count/$total_count"
  echo "Missing keys: $missing_count"
} >&2
