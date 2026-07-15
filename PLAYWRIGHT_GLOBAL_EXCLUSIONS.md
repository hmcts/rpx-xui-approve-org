# Playwright global exclusions

Approve Organisation uses one Key Vault-backed exclusion list for Playwright API, E2E, integration, and nightly cross-browser runs. Accessibility does not consume this list.

Use this as a temporary operational control when a tagged test area is blocking delivery. Keep a Jira ticket for the failure and remove the exclusion after the fix is verified.

## Runtime contract

- Key Vault secret: `xui-approve-org-playwright-global-excluded-tags`
- Runtime env var: `PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS`
- Bypass: `PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES=true`
- Clear/no-op value: `@none`

Global exclusions are additive. Each suite first resolves its checked-in defaults or replacement-style suite override, then adds global tags found in that suite's `availableTags` catalog.

The API, E2E, and integration catalogs form the repo-wide known-tag union. An unknown global value fails config loading, which catches typos instead of silently skipping nothing. After validation, each suite intersects the global list with its own `availableTags` catalog.

The suite catalogs are the scope boundary because tags can be shared. For example, `@search` is declared by E2E and integration, so a global `@search` excludes matching tests in both suites. A valid tag owned only by another functional suite is ignored by the current suite and reported as `globalIgnored` in diagnostics.

Suite overrides retain their existing replacement behavior:

- `E2E_PW_EXCLUDED_TAGS_OVERRIDE`
- `INTEGRATION_PW_EXCLUDED_TAGS_OVERRIDE`
- `API_PW_EXCLUDED_TAGS_OVERRIDE`

`@none` in a suite override clears checked-in defaults before globals are added. `@none` in the global list is only a no-op. The bypass disables only the global layer.

CI logs the resolved filters. Set `PLAYWRIGHT_LOG_TAG_FILTERS=true` for the same diagnostics locally.

## Key Vault commands

Set the target vault and secret once. Values must be space-separated.

```bash
vault_name='rpx-aat'
secret_name='xui-approve-org-playwright-global-excluded-tags'
incident_jira='EXUI-0000' # replace with the ticket tracking the current exclusion
```

View the current value:

```bash
az keyvault secret show \
  --vault-name "${vault_name}" \
  --name "${secret_name}" \
  --query value \
  --output tsv
```

Add `@search` while preserving all current exclusions and removing duplicates:

```bash
tag_to_add='@search'
current_value="$(az keyvault secret show --vault-name "${vault_name}" --name "${secret_name}" --query value --output tsv)"
updated_value="$(printf '%s\n' "${current_value} ${tag_to_add}" |
  tr ' ' '\n' |
  awk 'NF && $0 != "@none" && !seen[$0]++' |
  paste -sd ' ' -)"
az keyvault secret set \
  --vault-name "${vault_name}" \
  --name "${secret_name}" \
  --value "${updated_value:-@none}" \
  --tags e2e=PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS purpose=playwright-global-exclusions jira="${incident_jira}"
```

Remove only `@search` while preserving every other exclusion:

```bash
tag_to_remove='@search'
current_value="$(az keyvault secret show --vault-name "${vault_name}" --name "${secret_name}" --query value --output tsv)"
updated_value="$(printf '%s\n' "${current_value}" |
  tr ' ' '\n' |
  awk -v remove="${tag_to_remove}" 'NF && $0 != "@none" && $0 != remove && !seen[$0]++' |
  paste -sd ' ' -)"
az keyvault secret set \
  --vault-name "${vault_name}" \
  --name "${secret_name}" \
  --value "${updated_value:-@none}" \
  --tags e2e=PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS purpose=playwright-global-exclusions jira="${incident_jira}"
```

Remove all global exclusions:

```bash
az keyvault secret set \
  --vault-name "${vault_name}" \
  --name "${secret_name}" \
  --value '@none' \
  --tags e2e=PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS purpose=playwright-global-exclusions jira="${incident_jira}"
```

Repeat an update only for the non-production vaults that need it. Always run the view command first and review `updated_value` before setting a new version. These commands do not use comma-separated values.

## Local verification

```bash
PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS='@search' PLAYWRIGHT_LOG_TAG_FILTERS=true yarn test:functional:e2e:raw
PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS='@search' PLAYWRIGHT_LOG_TAG_FILTERS=true yarn test:integration:playwright:raw
PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS='@organisations' PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES=true yarn test:api:playwright:raw
```

Use the Jenkins `PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES` parameter when a branch fixes an excluded test. Checked-in defaults and suite overrides remain active.
