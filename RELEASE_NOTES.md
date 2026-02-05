# Release Notes

## Dependency Hygiene - rpx-xui-approve-org

### Summary
Reviewed project dependencies, removed unused packages, and moved test/tooling dependencies to devDependencies to reduce maintenance overhead while preserving runtime behavior.

### Changes
1. Removed unused production dependencies:
- @angular/animations
- @angular/cdk
- @angular/material
- @angular/platform-server
- @angular/ssr
- @hmcts/ccd-case-ui-toolkit
- @rxweb/reactive-form-validators
- braces
- connect-redis
- express-session
- get-port
- json-stringify-safe
- ngx-cookie-service
- openid-client
- passport
- rxjs-compat
- session-file-store
- shortid
- smoothscroll-polyfill
- striptags

2. Moved test/tooling dependencies to devDependencies:
- @playwright/test
- base-64
- git-rev-sync
- jsonwebtoken
- node-fetch
- sonar-scanner

3. Removed unused dev dependencies:
- cucumber-pretty

4. Peer dependency alignment:
- Retained launchdarkly-js-client-sdk and ngx-pagination to satisfy @hmcts/rpx-xui-common-lib peer requirements

5. Peer warning decision:
- Kept ngx-pagination at ^6.0.3 and rpx-xui-translation at 1.2.0-angular-20.3.14 despite @hmcts/rpx-xui-common-lib peer expectations

### Files Updated
- package.json
- yarn.lock (pending; yarn install failed due to permissions)
