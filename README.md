# Approve Organisation

Local development, configuration, and test guidance for `rpx-xui-approve-org`.

To run the application locally please make sure you follow the prerequisite task of
Setting up Secrets locally as documented below.

Then follow:
## Startup the Node service locally

1. Make sure you have local-development.json within /config, if you do not you can get this from an XUI team member.
2. Start the Node service locally using: 
`export IDAM_SECRET=* && export S2S_SECRET=* && export NODE_CONFIG_DIR=../config && export NODE_CONFIG_ENV=development
&& export ALLOW_CONFIG_MUTATIONS=1 && npm run start:node`

Explanation:

NODE_CONFIG_DIR tells the machine where the configuration for the Node application is located.
NODE_CONFIG_ENV=development sets the machine so that the config that is used is local-development.json

@see https://github.com/lorenwest/node-config/wiki/Configuration-Files

## Startup the Angular service locally 

Run `yarn start:ng` to start up the UI.

## Running unit tests

Run `yarn test` to execute Angular unit tests.
Run `yarn test:node` to execute Node unit tests.
Both are run on the build pipelines.

## Linting

Run `yarn lint` to execute all linting across both Angular and Node layers. Note that this
is run on the build pipelines.
Run `yarn lint:node` to execute node linting.

# Branches, Environment and Deployment methods used

```javascript
 |---------------------------------------|
 | Branch | Environment | Deployment via |
 |---------------------------------------|
 | local  | development | -              |
 | PR     | preview     | Jenkins        |
 | Master | aat         | Jenkins        |
 | Master | aat         | Flux           |
 | Master | ithc        | Flux           |
 | Master | production  | Flux           |
 |---------------------------------------|
```

# Path to configuration

The application should point to the configuration folder that contains the .json configuration files. There 
should only ever be three files within this folder:

`custom-environment-variables.json` - Allows configuration values to be set by the machines environmental values.
Through the Jenkins pipelines they are overwritten by values.*.template.yaml files for the Preview and AAT enviroments.
On AKS they are only overwritten by the values.yaml file
`default.json` - Should contain Production configuration values as per Reform standards.
`local-development.json` - Is used for local development.

Adding new files into /config should be avoided, as it increases complexity.

It increases complexity if we were to add files to /config as we already have the Preview and AAT Jenkins enviromental
values contained within values.preview.template.yaml and values.aat.template.yaml.

# Setting up Secrets locally (Required)

You need to setup secrets locally before you run the project. Why? - When you push this application
up through AKS deployed through Flux to AAT, ITHC and Prod, the application will take in the secrets on these environments.

The developer needs to set these up locally, so that the developer can see any issues early in
the development process, and not when the application is placed up onto the higher AKS environments.

To setup the secrets locally do the following:  

Note that Mac OS Catalina introduced a new feature that overlaps and reinforces the filesystem,
therefore you will not be able to make changes in the root directory of your file system, hence there are different
ways to setup secrets, Pre Catalina and Post Catalina, note that the Post Catalina way should work 
for all operating system, but I have yet to try this.

####MAC OS - Pre Catalina

1. Create a Mount point on your local machine<br/> 
Create the folder: `/mnt/secrets/rpx`
2. In this folder we create a file per secret.
ie.
We create the file postgresql-admin-pw (no extension).
Within the file we have one line of characters which is the secret.

####MAC OS - Post Catalina 

1. Create a Mount point on your local machine within the Volumes folder<br/>
Create the folder: `/Volumes/mnt/secrets/rpx`
2. In this folder we create a file per secret.
ie.
We create the file postgresql-admin-pw (no extension).
Within the file we have one line of characters which is the secret.
3. If you want to test the secrets locally override the default mountPoint with the following additional option added to .addTo
ie. 
`propertiesVolume.addTo(secretsConfig, { mountPoint: '/Volumes/mnt/secrets/' });`

Note that this is connected into the application via the following pieces of code:
```javascript
  keyVaults:
    rpx:
      secrets:
        - postgresql-admin-pw
        - appinsights-connection-string-ao
```

which in turn uses `propertiesVolume.addTo()`

# How Application Configuration (Node Config) Works

The application picks up the configuration from the /config .json files.

The references within *.json ie. production.json are set by the `/charts/xui-ao-webapp/values.yaml` file ie.
POSTGRES_SERVER_PORT is set by POSTGRES_SERVER_PORT within values.yaml. <br><br>HOWEVER if there is a
values.*.template.yaml file it will override the values within the values.yaml file, BUT this only happens on the JENKINS
pipelines, where values.*.template.yaml are available to the build pipeline.

AKS uses a .json file in /config and the values.yaml from within `charts/xui-ao-webapp` ONLY.
 
AKS does not use `values.aat.template.yaml` and `values.preview.template.yaml`.

DO NOT create a new .json file within /config as this increases the complexity of configuration. 

The 3rd party Node config package selects the file within /config based on `NODE_ENV` which is always production on all environments,
due to Reform standards, this does not change on different environments, it is always `NODE_ENV=production`

If production.json is not within /config, it will use the files in the order specified by
@see https://github.com/lorenwest/node-config/wiki/Configuration-Files

We DO NOT need to leverage `NODE_CONFIG_ENV` on this project - all application code should be written so that it's 
not environment specific!

Note about secrets ie. 

```javascript
  keyVaults:
    rpx:
      secrets:
        - postgresql-admin-pw
        - appinsights-connection-string-ao
 ```   
are set within the values.yaml and there should be NO REFERENCE to them within any /config/*.json file.

The application pulls out the secrets directly using `propertiesVolume.addTo()`

## Issues and Solutions

Property 'cookies' does not exist on type 'EnhancedRequest' - you will need to make
sure @types/express-session is added ie.
`yarn add @types/express-session`

### The following is legacy readme.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running end-to-end tests

This repository now uses Playwright for the functional/liveliness test path.

- `yarn test:smoke` runs the Playwright smoke journey (`playwright_tests/e2e/login.test.ts`).
- `yarn test:functional` runs the Playwright E2E suite (`playwright_tests/e2e`) unless `PLAYWRIGHT_FUNCTIONAL_PARALLEL_ALREADY_RUN=true` (used by Jenkins parallel functional stages).
- `yarn test:functional:parallel` runs Playwright E2E (`playwright_tests/e2e`), Playwright API (`playwright_tests/api`), and Playwright integration (`playwright_tests/integration`) suites in parallel by invoking separate commands.
- `yarn test:functional:e2e` runs only Playwright E2E (`playwright_tests/e2e`).
- `yarn test:crossbrowser` runs cross-browser Playwright tests using `playwright-nightly.config.ts`.
- `yarn test:api:playwright` runs the Playwright API suite (`playwright_tests/api`) using `playwright-api.config.ts`.
- `yarn test:integration:playwright` runs the Playwright integration suite (`playwright_tests/integration`) using `playwright-integration.config.ts`.
- `yarn test:accessibility:playwright` runs the Playwright accessibility suite (`playwright_tests/accessibility`) using `playwright-accessibility.config.ts`. The default pack runs axe, WAVE-like and screen-reader checks.
- `yarn test:lighthouse-a11y:playwright` runs the same accessibility suite with the Lighthouse engine only. Set `A11Y_ENGINES=all` or `PLAYWRIGHT_A11Y_ENGINES=all` to include Lighthouse in the unified accessibility pack.
- Playwright API specs use filename split in one folder (`*.positive.api.test.ts` and `*.negative.api.test.ts`) under `playwright_tests/api`.
- Playwright integration specs use shared authenticated request fixtures from `playwright_tests/framework/fixtures/auth-request.fixtures.ts`.
- Tag catalogs are stored in JSON files: `playwright_tests/e2e/tag-filter.json`, `playwright_tests/integration/tag-filter.json`, `playwright_tests/api/tag-filter.json`, and `playwright_tests/accessibility/tag-filter.json`.
- Include tags per suite with `E2E_PW_INCLUDE_TAGS`, `INTEGRATION_PW_INCLUDE_TAGS`, `API_PW_INCLUDE_TAGS`, and `A11Y_PW_INCLUDE_TAGS`.
- Override excluded tags per suite with `E2E_PW_EXCLUDED_TAGS_OVERRIDE`, `INTEGRATION_PW_EXCLUDED_TAGS_OVERRIDE`, `API_PW_EXCLUDED_TAGS_OVERRIDE`, and `A11Y_PW_EXCLUDED_TAGS_OVERRIDE` (`@none` clears file-based excludes).
- Override catalog paths with `E2E_PW_TAG_FILTER_CONFIG`, `INTEGRATION_PW_TAG_FILTER_CONFIG`, `API_PW_TAG_FILTER_CONFIG`, and `A11Y_PW_TAG_FILTER_CONFIG` when needed.
- `TEST_URL` can be set to target a different environment (default: AAT URL).
- `TEST_REGISTER_URL` can be set for registration flow tests; when unset, Playwright derives the Manage Org URL from `TEST_URL` for AAT and Demo, with preview defaulting to AAT unless overridden.
- `APPROVE_ORG_ADMIN_USERNAME` and `APPROVE_ORG_ADMIN_PASSWORD` are the Playwright auth credentials for E2E and integration suites.
- `APPROVE_ORG_API_USERNAME` and `APPROVE_ORG_API_PASSWORD` are the Playwright auth credentials for API suites.
- `PW_INTEGRATION_UPDATE_PBA_ORG_ID` can override the org id used by the seeded integration write scenario.
- `FUNCTIONAL_TESTS_WORKERS` can be set to override Playwright worker count.

### Running Playwright against AAT, DEMO, ITHC and LOCAL

Use `TEST_URL` for the Approve Organisation app and `TEST_REGISTER_URL` for the Manage Organisation registration host used by registration flows. If `TEST_REGISTER_URL` is not set, the framework derives it for AAT and DEMO from `TEST_URL`; set it explicitly for ITHC and preview-style targets.

| Environment | `TEST_URL` | `TEST_REGISTER_URL` |
| ----------- | ---------- | ------------------- |
| AAT         | `https://administer-orgs.aat.platform.hmcts.net/` | `https://manage-org.aat.platform.hmcts.net/` |
| DEMO        | `https://administer-orgs.demo.platform.hmcts.net/` | `https://manage-org.demo.platform.hmcts.net/` |
| ITHC        | `https://administer-orgs.ithc.platform.hmcts.net/` | `https://manage-org.ithc.platform.hmcts.net/` |
| LOCAL       | `http://localhost:3000` | `http://localhost:3000` |

Populate and source local secrets before shared-environment runs:

```bash
# AAT
yarn env:populate:aat
set -a; source .env; set +a

# DEMO
yarn env:populate:demo
set -a; source .env; set +a
```

For ITHC, export the required credentials through an approved local secret mechanism. Do not commit credentials or paste passwords into commands.

Common commands:

```bash
# AAT
yarn test:functional:e2e:raw
yarn test:api:playwright:raw
yarn test:integration:playwright:raw

# DEMO
TEST_URL=https://administer-orgs.demo.platform.hmcts.net/ \
TEST_REGISTER_URL=https://manage-org.demo.platform.hmcts.net/ \
yarn test:functional:e2e:raw

# ITHC
TEST_URL=https://administer-orgs.ithc.platform.hmcts.net/ \
TEST_REGISTER_URL=https://manage-org.ithc.platform.hmcts.net/ \
yarn test:functional:e2e:raw

# LOCAL
TEST_URL=http://localhost:3000 \
TEST_REGISTER_URL=http://localhost:3000 \
yarn test:functional:e2e:raw
```

### Local selector-check runs

Use these when validating against a specific deployment target.

1. Export E2E/integration credentials first (`APPROVE_ORG_ADMIN_USERNAME` and `APPROVE_ORG_ADMIN_PASSWORD`).
2. Export API credentials when running Playwright API tests (`APPROVE_ORG_API_USERNAME` and `APPROVE_ORG_API_PASSWORD`).
3. Run against a local build:

```bash
export TEST_URL="http://localhost:3000"
yarn test:functional:e2e:raw
```

4. Run against an ephemeral preview build:

```bash
export TEST_URL="https://xui-ao-webapp-pr-<PR_NUMBER>.preview.platform.hmcts.net"
yarn test:functional:e2e:raw
```

5. Optional: run only a targeted selector test:

```bash
yarn test:functional:e2e:raw --grep "tabs on login load data"
```

6. Optional: run by E2E tag from the JSON catalog:

```bash
E2E_PW_INCLUDE_TAGS='@smoke' yarn test:functional:e2e:raw
```

7. Optional: run integration while excluding one tagged area:

```bash
INTEGRATION_PW_EXCLUDED_TAGS_OVERRIDE='@pending-decisions' yarn test:integration:playwright:raw
```

8. Optional: run only negative API tests:

```bash
API_PW_INCLUDE_TAGS='@negative' yarn test:api:playwright:raw
```

9. Optional: run only staff-details accessibility tests:

```bash
A11Y_PW_INCLUDE_TAGS='@staff-details' yarn test:accessibility:playwright:raw
```

### Azure Key Vault env population

This repo includes scripts to generate local env files by resolving template keys from Azure Key Vault secrets where `tags.e2e` matches the env key name.

Environment to vault mapping is fixed to:

- `aat` -> `rpx-aat`
- `demo` -> `rpx-demo`

Prerequisites:

- Azure CLI installed
- Authenticated with Azure CLI
- Correct subscription selected
- Access to `rpx-aat` and `rpx-demo` Key Vaults

```bash
az login
az account set --subscription <subscription>
```

Template files:

- Root env template: `.env.example`

Populate commands write to `.env` using `.env.example` by default.

Generate env files:

```bash
yarn env:populate
yarn env:populate:aat
yarn env:populate:demo
```

The base commands default to `aat`. To override:

```bash
ENVIRONMENT=demo yarn env:populate
```

Equivalent npm commands:

```bash
npm run env:populate
npm run env:populate:aat
npm run env:populate:demo
```

Direct script usage with explicit paths:

```bash
./scripts/populate-env-from-keyvault.sh aat .env .env.example
./scripts/populate-env-from-keyvault.sh demo .env .env.example
```

Behavior notes:

- Missing tagged secrets do not fail the run.
- Missing keys are written as blank values and logged as warnings.
- Generated local env files include resolved values only at runtime and should not be committed.

### Add new username/password credentials to Key Vault

Use `--tags e2e=<ENV_KEY>` so the populate scripts can map secrets to env keys.

Example admin credentials for `APPROVE_ORG_ADMIN_USERNAME`/`APPROVE_ORG_ADMIN_PASSWORD` and API credentials for `APPROVE_ORG_API_USERNAME`/`APPROVE_ORG_API_PASSWORD` in both vaults:

```bash
az keyvault secret set --vault-name rpx-aat --name approve-org-admin-username --value "user@example.com" --tags e2e=APPROVE_ORG_ADMIN_USERNAME
az keyvault secret set --vault-name rpx-aat --name approve-org-admin-password --value "change-me" --tags e2e=APPROVE_ORG_ADMIN_PASSWORD
az keyvault secret set --vault-name rpx-aat --name approve-org-api-username --value "user@example.com" --tags e2e=APPROVE_ORG_API_USERNAME
az keyvault secret set --vault-name rpx-aat --name approve-org-api-password --value "change-me" --tags e2e=APPROVE_ORG_API_PASSWORD

az keyvault secret set --vault-name rpx-demo --name approve-org-admin-username --value "user@example.com" --tags e2e=APPROVE_ORG_ADMIN_USERNAME
az keyvault secret set --vault-name rpx-demo --name approve-org-admin-password --value "change-me" --tags e2e=APPROVE_ORG_ADMIN_PASSWORD
az keyvault secret set --vault-name rpx-demo --name approve-org-api-username --value "user@example.com" --tags e2e=APPROVE_ORG_API_USERNAME
az keyvault secret set --vault-name rpx-demo --name approve-org-api-password --value "change-me" --tags e2e=APPROVE_ORG_API_PASSWORD
```

If credentials are required in both `aat` and `demo`, add them to both `rpx-aat` and `rpx-demo` with the same `tags.e2e` key mapping.

CI/Jenkins notes:

- `smoketest:*` stages publish Playwright E2E HTML reports from `functional-output/tests/playwright-e2e/odhin-report`, and nightly cross-browser publishes from `functional-output/tests/playwright-nightly/odhin-report`.
- `functionalTest:*` stages publish Playwright E2E (`functional-output/tests/playwright-e2e/odhin-report`), Playwright API (`functional-output/tests/playwright-api/odhin-report`), Playwright integration (`functional-output/tests/playwright-integration/odhin-report`), and Playwright accessibility (`functional-output/tests/playwright-accessibility/odhin-report`) HTML reports.
- PR and nightly functional stages run API, integration, E2E, and accessibility as separate parallel Jenkins branches.
- CNP and nightly Jenkins pipelines expose optional build parameters for tag filtering: `E2E_PW_INCLUDE_TAGS`, `E2E_PW_EXCLUDED_TAGS_OVERRIDE`, `INTEGRATION_PW_INCLUDE_TAGS`, `INTEGRATION_PW_EXCLUDED_TAGS_OVERRIDE`, `API_PW_INCLUDE_TAGS`, `API_PW_EXCLUDED_TAGS_OVERRIDE`, `A11Y_PW_INCLUDE_TAGS`, and `A11Y_PW_EXCLUDED_TAGS_OVERRIDE`.
- Accessibility stage failures are informational: the accessibility stage is marked `UNSTABLE` but does not fail the overall build.
- Follow-up TODO: align browser install handling with `rpx-xui-webapp` (`test:setup:playwright-install-chromium` + `PLAYWRIGHT_SKIP_INSTALL=true` in parallel test branches) to avoid duplicate install work.

## Integration Documentation

https://tools.hmcts.net/confluence/display/EUI/EXUI+Low+Level+Design

## Further help

To get more help on the Angular CLI use `ng help` or go and check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Logger errors and warnings

Extended version of script below:

(https://robferguson.org/blog/2017/09/09/a-simple-logging-service-for-angular-4/)

END
