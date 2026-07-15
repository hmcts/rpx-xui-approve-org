# Playwright global exclusions

Approve Organisation uses one Key Vault-backed exclusion list for Playwright API, E2E, integration, and nightly cross-browser runs. Accessibility does not consume this list.

Use this as a temporary operational control when a tagged test area is blocking delivery. Keep a Jira ticket for the failure and remove the exclusion after the fix is verified.

## Runtime contract

- Key Vault secret: `xui-approve-org-playwright-global-excluded-tags`
- Local-population tag: `e2e=APPROVE_ORG_PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS`
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

Values must be space-separated. Run the view command before changing a value. The examples below show the complete value after the change, not a delta; preserve every unrelated current exclusion in `--value`.

View the current AAT value:

```bash
az keyvault secret show \
  --vault-name rpx-aat \
  --name xui-approve-org-playwright-global-excluded-tags \
  --query value \
  --output tsv
```

View the complete current metadata:

```bash
az keyvault secret show \
  --vault-name rpx-aat \
  --name xui-approve-org-playwright-global-excluded-tags \
  --query tags \
  --output json
```

After confirming the current value is `@organisations`, add `@search` while preserving `@organisations`:

```bash
az keyvault secret set \
  --vault-name rpx-aat \
  --name xui-approve-org-playwright-global-excluded-tags \
  --value '@organisations @search' \
  --tags e2e=APPROVE_ORG_PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS file-encoding=utf-8 purpose=playwright-global-exclusions jira=EXUI-0000
```

After confirming the current value is `@organisations @search`, remove only `@search` while preserving `@organisations`:

```bash
az keyvault secret set \
  --vault-name rpx-aat \
  --name xui-approve-org-playwright-global-excluded-tags \
  --value '@organisations' \
  --tags e2e=APPROVE_ORG_PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS file-encoding=utf-8 purpose=playwright-global-exclusions
```

Remove all global exclusions:

```bash
az keyvault secret set \
  --vault-name rpx-aat \
  --name xui-approve-org-playwright-global-excluded-tags \
  --value '@none' \
  --tags e2e=APPROVE_ORG_PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS file-encoding=utf-8 purpose=playwright-global-exclusions
```

Replace `rpx-aat` only when updating another non-production vault. The `jira=EXUI-0000` metadata shown in the add example is optional; preserve the current Jira tag when one is already present. Because `az keyvault secret set --tags` replaces the complete tag set, preserve the live `e2e`, `file-encoding`, `purpose` and any other metadata fields on every update. Review the complete explicit `--value` before creating a new secret version, and do not remove unrelated exclusions.

## Local verification

```bash
PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS='@search' PLAYWRIGHT_LOG_TAG_FILTERS=true yarn test:functional:e2e:raw
PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS='@search' PLAYWRIGHT_LOG_TAG_FILTERS=true yarn test:integration:playwright:raw
PLAYWRIGHT_GLOBAL_EXCLUDED_TAGS='@organisations' PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES=true yarn test:api:playwright:raw
```

Use the Jenkins `PLAYWRIGHT_IGNORE_GLOBAL_EXCLUDES` parameter when a branch fixes an excluded test. Checked-in defaults and suite overrides remain active.
