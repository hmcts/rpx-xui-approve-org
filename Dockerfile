ARG REGISTRY_NAME=hmctsprod
FROM ${REGISTRY_NAME}.azurecr.io/base/node:20-alpine AS base
LABEL maintainer = "HMCTS Expert UI <https://github.com/hmcts>"

USER root
RUN corepack enable

USER hmcts

COPY --chown=hmcts:hmcts .yarn ./.yarn
COPY --chown=hmcts:hmcts package.json yarn.lock .yarnrc.yml tsconfig.json ./
COPY --chown=hmcts:hmcts api/package.json ./api/package.json

RUN yarn

FROM base AS build

COPY --chown=hmcts:hmcts . .

RUN yarn build && rm -r node_modules/ && yarn cache clean

FROM base AS runtime
COPY --from=build $WORKDIR ./
USER hmcts
EXPOSE 3000
CMD [ "yarn", "start" ]
