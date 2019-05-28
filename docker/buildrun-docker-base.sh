#!/bin/sh
DIR="$( cd "$( dirname "$0" )" && pwd )/"
clear;
${DIR}/../bin/fakeversion.sh

docker-compose -f ${DIR}/compose/docker-compose-dm.yml \
-f ${DIR}/compose/docker-compose-ccd.yml \
-f ${DIR}/compose/docker-compose-idam.yml \
down

docker-compose -f ${DIR}/compose/docker-compose-dm.yml \
-f ${DIR}/compose/docker-compose-ccd.yml \
-f ${DIR}/compose/docker-compose-idam.yml \
pull

docker-compose -f ${DIR}/compose/docker-compose-dm.yml \
-f ${DIR}/compose/docker-compose-ccd.yml \
-f ${DIR}/compose/docker-compose-idam.yml \
up --build


#docker-compose -f ${DIR}/compose/docker-compose-dm.yml \
#-f ${DIR}/compose/docker-compose-em.yml \
#-f ${DIR}/compose/docker-compose-ccd.yml \
#-f ${DIR}/compose/docker-compose-idam.yml \
#down
#
#docker-compose -f ${DIR}/compose/docker-compose-dm.yml \
#-f ${DIR}/compose/docker-compose-em.yml \
#-f ${DIR}/compose/docker-compose-ccd.yml \
#-f ${DIR}/compose/docker-compose-idam.yml \
#pull
#
#docker-compose -f ${DIR}/compose/docker-compose-dm.yml \
#-f ${DIR}/compose/docker-compose-em.yml \
#-f ${DIR}/compose/docker-compose-ccd.yml \
#-f ${DIR}/compose/docker-compose-idam.yml \
#up --build
