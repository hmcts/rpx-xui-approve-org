ARG base=hmctspublic.azurecr.io/base/node/stretch-slim-lts-8:8-stretch-slim

FROM ${base} AS build
LABEL maintainer = "HMCTS Team <https://github.com/hmcts>"

COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
RUN yarn install --production

FROM ${base} AS runtime
COPY --from=build ${WORKDIR}/ .
CMD [ "yarn", "start" ]
