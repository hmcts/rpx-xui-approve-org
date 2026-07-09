ARG REGISTRY_NAME=hmctsprod
FROM ${REGISTRY_NAME}.azurecr.io/base/node:20-alpine AS base
LABEL maintainer = "HMCTS Expert UI <https://github.com/hmcts>"

ARG DEV_MODE=false

USER hmcts

COPY --chown=hmcts:hmcts .yarn ./.yarn
COPY --chown=hmcts:hmcts package.json yarn.lock .yarnrc.yml tsconfig.json ./
COPY --chown=hmcts:hmcts api/package.json ./api/package.json

RUN PUPPETEER_SKIP_DOWNLOAD=true node .yarn/releases/yarn-4.10.3.cjs install --immutable

FROM base AS build

COPY --chown=hmcts:hmcts . .

RUN node .yarn/releases/yarn-4.10.3.cjs build && rm -r node_modules/ && node .yarn/releases/yarn-4.10.3.cjs cache clean

FROM base AS runtime
COPY --from=build $WORKDIR ./
USER hmcts
EXPOSE 3000
CMD [ "node", ".yarn/releases/yarn-4.10.3.cjs", "start" ]
